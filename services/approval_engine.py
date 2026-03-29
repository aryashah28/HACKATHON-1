from models.approval import Approval
from models.approval_rule import ApprovalRule, ApprovalSequence
from models.expense import Expense
from models.user import User
from sqlalchemy import and_
from typing import Dict, List, Optional
from datetime import datetime

class ApprovalEngine:
    """
    Multi-approver approval workflow engine.
    
    Supports:
    - Sequential approvals (1st approver -> 2nd approver -> ...)
    - Percentage-based approvals (60% of approvers)
    - Specific approver rules (CFO auto-approval)
    - Manager-first approvals
    """

    @staticmethod
    def create_approval_workflow(db, expense_id: int, company_id: int, rule_id: Optional[int] = None):
        """
        Create approval workflow for an expense based on company rules.
        
        Args:
            db: Database session
            expense_id: Expense ID
            company_id: Company ID
            rule_id: Optional specific approval rule ID
        """
        expense = db.query(Expense).filter_by(id=expense_id).first()
        if not expense:
            raise ValueError("Expense not found")
        
        # Find applicable rule if not specified
        if not rule_id:
            rule = ApprovalEngine._find_applicable_rule(db, company_id, expense.amount)
        else:
            rule = db.query(ApprovalRule).filter_by(id=rule_id).first()
        
        if not rule:
            # Default: manager approval required
            ApprovalEngine._create_manager_approval(db, expense)
            return
        
        # Get approvers from rule's sequence
        sequences = db.query(ApprovalSequence).filter_by(rule_id=rule.id).order_by(ApprovalSequence.sequence_order).all()
        
        if not sequences:
            ApprovalEngine._create_manager_approval(db, expense)
            return
        
        # Create approvals for each sequence step
        for seq in sequences:
            approval = Approval(
                expense_id=expense_id,
                approver_id=seq.approver_id,
                status="pending",
                step=seq.sequence_order,
                rule_id=rule_id,
                is_manager_approval=(seq.sequence_order == 1 and rule.requires_manager)
            )
            db.add(approval)
        
        expense.rule_id = rule_id
        expense.status = "pending"
        db.commit()

    @staticmethod
    def _find_applicable_rule(db, company_id: int, amount: float) -> Optional[ApprovalRule]:
        """Find the applicable approval rule for amount"""
        rules = db.query(ApprovalRule).filter(
            and_(
                ApprovalRule.company_id == company_id,
                ApprovalRule.is_active == True
            )
        ).all()
        
        # Find the most specific rule (highest amount threshold that still applies)
        applicable_rule = None
        for rule in rules:
            if rule.amount_threshold is None or amount >= rule.amount_threshold:
                if not applicable_rule or rule.amount_threshold > applicable_rule.amount_threshold:
                    applicable_rule = rule
        
        return applicable_rule

    @staticmethod
    def _create_manager_approval(db, expense: Expense):
        """Create a simple manager approval workflow"""
        submitter = db.query(User).filter_by(id=expense.user_id).first()
        if not submitter or not submitter.manager_id:
            # No manager, auto-approve
            expense.status = "approved"
        else:
            approval = Approval(
                expense_id=expense.id,
                approver_id=submitter.manager_id,
                status="pending",
                step=1,
                is_manager_approval=True
            )
            db.add(approval)
            expense.status = "pending"
        
        db.commit()

    @staticmethod
    def process_approval(db, approval_id: int, decision: str, comments: str = "") -> Dict:
        """
        Process an approval decision (approve/reject) and update expense status.
        
        Args:
            db: Database session
            approval_id: Approval ID
            decision: "approved" or "rejected"
            comments: Optional comments from approver
        
        Returns:
            Dictionary with result status
        """
        approval = db.query(Approval).filter_by(id=approval_id).first()
        if not approval:
            raise ValueError("Approval not found")
        
        approval.status = decision
        approval.comments = comments
        approval.approved_at = datetime.utcnow()
        
        expense = db.query(Expense).filter_by(id=approval.expense_id).first()
        
        if decision == "rejected":
            # Any rejection means expense is rejected
            expense.status = "rejected"
            db.commit()
            return {"status": "rejected", "message": "Expense rejected"}
        
        # Check if all approvals for this step are satisfied
        rule = db.query(ApprovalRule).filter_by(id=expense.rule_id).first() if expense.rule_id else None
        
        if not rule:
            # Simple workflow: just check if pending approvals exist
            pending = db.query(Approval).filter(
                and_(
                    Approval.expense_id == expense.id,
                    Approval.status == "pending"
                )
            ).count()
            
            if pending == 0:
                expense.status = "approved"
                db.commit()
                return {"status": "approved", "message": "All approvers have approved"}
        else:
            # Check rule-specific approval logic
            return ApprovalEngine._check_rule_completion(db, expense, rule)
        
        expense.status = "manager_approved"
        db.commit()
        return {"status": "pending", "message": "Waiting for remaining approvals"}

    @staticmethod
    def _check_rule_completion(db, expense: Expense, rule: ApprovalRule) -> Dict:
        """Check if approval is complete based on rule type"""
        
        approvals = db.query(Approval).filter_by(expense_id=expense.id).all()
        total_approvers = len(approvals)
        approved_count = sum(1 for a in approvals if a.status == "approved")
        
        if rule.rule_type == "percentage":
            required_percentage = (rule.percentage_required or 60) / 100
            required_approvals = int(total_approvers * required_percentage)
            
            if approved_count >= required_approvals:
                expense.status = "approved"
                db.commit()
                return {
                    "status": "approved",
                    "message": f"Approval threshold reached ({approved_count}/{required_approvals})"
                }
        
        elif rule.rule_type == "specific_approver":
            # Check if specific approver has approved
            specific_approval = db.query(Approval).filter(
                and_(
                    Approval.expense_id == expense.id,
                    Approval.approver_id == rule.specific_approver_id,
                    Approval.status == "approved"
                )
            ).first()
            
            if specific_approval:
                expense.status = "approved"
                db.commit()
                return {
                    "status": "approved",
                    "message": "Approved by required approver"
                }
        
        elif rule.rule_type == "sequential":
            # Check if current step is complete, move to next
            current_step = max(a.step for a in approvals)
            step_complete = all(
                a.status != "pending" for a in approvals
                if a.step == current_step
            )
            
            if step_complete:
                # Check if there's a next step
                next_step = current_step + 1
                has_next = any(a.step == next_step for a in approvals)
                
                if not has_next:
                    expense.status = "approved"
                    db.commit()
                    return {
                        "status": "approved",
                        "message": "All approval steps completed"
                    }
        
        db.commit()
        pending = sum(1 for a in approvals if a.status == "pending")
        return {
            "status": "pending",
            "message": f"Waiting for {pending} more approval(s)"
        }

    @staticmethod
    def get_approval_status(db, expense_id: int) -> Dict:
        """Get detailed approval status for an expense"""
        approvals = db.query(Approval).filter_by(expense_id=expense_id).order_by(Approval.step).all()
        
        approvers = []
        for approval in approvals:
            approver = db.query(User).filter_by(id=approval.approver_id).first()
            approvers.append({
                "step": approval.step,
                "approver_name": approver.username if approver else "Unknown",
                "status": approval.status,
                "comments": approval.comments,
                "approved_at": approval.approved_at.isoformat() if approval.approved_at else None
            })
        
        return {
            "expense_id": expense_id,
            "approvers": approvers,
            "pending_count": sum(1 for a in approvals if a.status == "pending"),
            "approved_count": sum(1 for a in approvals if a.status == "approved"),
            "rejected": any(a.status == "rejected" for a in approvals)
        }

    @staticmethod
    def override_approval(db, expense_id: int, admin_id: int, decision: str) -> Dict:
        """
        Admin override an approval decision.
        
        Args:
            db: Database session
            expense_id: Expense ID
            admin_id: Admin user ID
            decision: "approved" or "rejected"
        
        Returns:
            Result dictionary
        """
        expense = db.query(Expense).filter_by(id=expense_id).first()
        if not expense:
            raise ValueError("Expense not found")
        
        # Mark all pending approvals as overridden
        db.query(Approval).filter(
            and_(
                Approval.expense_id == expense_id,
                Approval.status == "pending"
            )
        ).update({"status": "overridden"})
        
        # Create admin override approval record
        override_approval = Approval(
            expense_id=expense_id,
            approver_id=admin_id,
            status=decision,
            step=999,  # Special step for overrides
            comments="Admin override"
        )
        db.add(override_approval)
        
        expense.status = decision
        db.commit()
        
        return {
            "status": "overridden",
            "message": f"Expense {decision} by admin override",
            "admin_id": admin_id
        }
