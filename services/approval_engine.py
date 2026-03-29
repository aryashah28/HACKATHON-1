from models.approval import Approval
from models.approval_rule import ApprovalRule
from models.user import User
from datetime import datetime

def create_approval_workflow(db, expense, company_id):
    """Create approval workflow for an expense based on company rules"""
    rules = db.query(ApprovalRule).filter_by(
        company_id=company_id,
        is_active=True
    ).all()
    
    # Find applicable rule for this expense
    applicable_rule = None
    for rule in rules:
        if rule.threshold_amount is None or expense.amount_in_company_currency >= rule.threshold_amount:
            applicable_rule = rule
            break
    
    if applicable_rule and applicable_rule.approver_sequence:
        # Create approval steps based on sequence
        for step_info in applicable_rule.approver_sequence:
            step = step_info.get("step", 1)
            role = step_info.get("role")
            
            # Get approver(s) with this role
            approvers = db.query(User).filter_by(
                company_id=company_id,
                role=role,
                is_manager_approver=True
            ).all()
            
            for approver in approvers:
                approval = Approval(
                    expense_id=expense.id,
                    approver_id=approver.id,
                    approval_rule_id=applicable_rule.id,
                    step=step,
                    is_current=(step == 1),
                    decision_type=applicable_rule.rule_type
                )
                db.add(approval)
    else:
        # Default: Manager approval required
        if expense.user.manager_id:
            approval = Approval(
                expense_id=expense.id,
                approver_id=expense.user.manager_id,
                step=1,
                is_current=True,
                decision_type="manager"
            )
            db.add(approval)
    
    db.commit()

def move_to_next_approval(db, expense, approver_id, decision):
    """Move expense to next approver after current approval"""
    current_approval = db.query(Approval).filter_by(
        expense_id=expense.id,
        is_current=True
    ).first()
    
    if current_approval:
        current_approval.is_current = False
        current_approval.status = decision  # approved or rejected
        current_approval.decided_at = datetime.utcnow()
        
        if decision == "approved":
            # Get next step approval
            next_approval = db.query(Approval).filter_by(
                expense_id=expense.id,
                step=current_approval.step + 1
            ).first()
            
            if next_approval:
                next_approval.is_current = True
            else:
                # All approvals done - mark expense as approved
                expense.status = "approved"
        else:
            # Rejected - mark as rejected
            expense.status = "rejected"
        
        db.commit()

def evaluate_approval_rule(db, expense):
    """Evaluate if expense meets approval rule conditions"""
    approvals = db.query(Approval).filter_by(expense_id=expense.id).all()
    approved = [a for a in approvals if a.status == "approved"]
    
    rule = db.query(ApprovalRule).filter_by(id=approvals[0].approval_rule_id).first() if approvals else None
    
    if not rule:
        # Default: all must approve
        return all(a.status == "approved" for a in approvals) if approvals else False
    
    if rule.rule_type == "percentage":
        if len(approvals) == 0:
            return False
        return len(approved) / len(approvals) >= (rule.percentage_required or 1.0)
    
    elif rule.rule_type == "specific_approver":
        return any(a.approver_id == rule.specific_approver_id and a.status == "approved" for a in approvals)
    
    elif rule.rule_type == "hybrid":
        # Both conditions: percentage AND specific approver
        percentage_met = len(approved) / len(approvals) >= (rule.percentage_required or 1.0) if approvals else False
        specific_approved = any(
            a.approver_id == rule.specific_approver_id and a.status == "approved" 
            for a in approvals
        )
        return percentage_met or specific_approved
    
    return False