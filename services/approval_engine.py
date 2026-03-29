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
    """Update approval status and move to next step if required"""
    
    # Find the specific approval for this approver that is currently active and pending
    current_approval = db.query(Approval).filter_by(
        expense_id=expense.id,
        approver_id=approver_id,
        status="pending",
        is_current=True
    ).first()
    
    if not current_approval:
        # Check if the approver_id is valid for this expense at all (maybe it was already decided)
        return False
    
    # Record the decision
    current_approval.status = decision  # approved or rejected
    current_approval.decided_at = datetime.utcnow()
    
    # Critical: if any step is rejected, the whole expense is rejected (standard policy)
    if decision == "rejected":
        expense.status = "rejected"
        # Deactivate all other pending approvals for this expense
        db.query(Approval).filter_by(expense_id=expense.id, status="pending").update({"is_current": False})
        db.commit()
        return True
    
    # If approved, evaluate if the current step criteria is met
    # For many rules, we need all approvals in the current step or a percentage
    current_step = current_approval.step
    all_step_approvals = db.query(Approval).filter_by(
        expense_id=expense.id,
        step=current_step
    ).all()
    
    is_step_complete = False
    
    # If there's a rule, use its logic
    if current_approval.approval_rule_id:
        rule = db.query(ApprovalRule).get(current_approval.approval_rule_id)
        if rule:
            is_step_complete = evaluate_approval_rule_logic(rule, all_step_approvals)
    else:
        # Default: if no rule, all must approve
        is_step_complete = all(a.status == "approved" for a in all_step_approvals)
        
    if is_step_complete:
        # Find if there are approvals for the next step
        next_step_approvals = db.query(Approval).filter_by(
            expense_id=expense.id,
            step=current_step + 1
        ).all()
        
        if next_step_approvals:
            # Move to next step
            for a in next_step_approvals:
                a.is_current = True
            # Deactivate current step
            for a in all_step_approvals:
                a.is_current = False
        else:
            # All steps finished
            expense.status = "approved"
            for a in all_step_approvals:
                a.is_current = False
                
    db.commit()
    return True

def evaluate_approval_rule_logic(rule, approvals):
    """Internal helper to evaluate rule criteria against a set of approvals"""
    approved = [a for a in approvals if a.status == "approved"]
    
    if rule.rule_type == "percentage":
        if not approvals:
            return False
        return len(approved) / len(approvals) >= (rule.percentage_required or 1.0)
    
    elif rule.rule_type == "specific_approver":
        # At least the specific approver must have approved
        return any(a.approver_id == rule.specific_approver_id and a.status == "approved" for a in approvals)
    
    elif rule.rule_type == "hybrid":
        # Percentage OR specific approver
        percentage_met = len(approved) / len(approvals) >= (rule.percentage_required or 1.0) if approvals else False
        specific_approved = any(
            a.approver_id == rule.specific_approver_id and a.status == "approved" 
            for a in approvals
        )
        return percentage_met or specific_approved
    
    # Default: mandatory all approve
    return all(a.status == "approved" for a in approvals)

def evaluate_approval_rule(db, expense):
    """
    Public function to check if an expense is fully approved based on all its approvals.
    Useful for final validation.
    """
    approvals = db.query(Approval).filter_by(expense_id=expense.id).all()
    if not approvals:
        return False
        
    rule_id = approvals[0].approval_rule_id
    if not rule_id:
        return all(a.status == "approved" for a in approvals)
        
    rule = db.query(ApprovalRule).get(rule_id)
    if not rule:
        return all(a.status == "approved" for a in approvals)
        
    return evaluate_approval_rule_logic(rule, approvals)

def admin_override_expense(db, expense, admin_id, decision):
    """Admin forces a final decision on an expense, bypassing the workflow"""
    # 1. Update the expense status
    expense.status = decision
    
    # 2. Update all current/pending approvals for this expense
    db.query(Approval).filter_by(
        expense_id=expense.id,
        status="pending",
        is_current=True
    ).update({
        "status": f"overridden_{decision}",
        "decided_at": datetime.utcnow(),
        "is_current": False,
        "comments": f"Overridden by Admin (ID: {admin_id})"
    })
    
    db.commit()
    return True
