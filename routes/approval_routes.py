from fastapi import APIRouter, Depends, HTTPException
from database.db import get_db
from models.approval import Approval
from models.expense import Expense
from services.approval_engine import ApprovalEngine

router = APIRouter()

@router.post("/approve")
def approve(approval_id: int, decision: str, db=Depends(get_db)):
    """
    Process an approval decision (approve/reject) for an expense.
    """
    try:
        result = ApprovalEngine.process_approval(db, approval_id, decision)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/pending_approvals")
def get_pending_approvals(user_id: int, db=Depends(get_db)):
    """
    Get all pending approvals for a user.
    """
    approvals = db.query(Approval).filter(
        Approval.approver_id == user_id,
        Approval.status == "pending"
    ).all()
    
    result = []
    for approval in approvals:
        expense = db.query(Expense).get(approval.expense_id)
        result.append({
            "id": approval.id,
            "expense_id": approval.expense_id,
            "step": approval.step,
            "status": approval.status,
            "amount": expense.amount if expense else 0,
            "currency": expense.currency if expense else "USD",
            "category": expense.category if expense else None,
            "description": expense.description if expense else None
        })
    
    return result


@router.get("/approval_status/{expense_id}")
def get_approval_status(expense_id: int, db=Depends(get_db)):
    """
    Get detailed approval workflow status for an expense.
    """
    try:
        status = ApprovalEngine.get_approval_status(db, expense_id)
        return status
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/override_approval")
def override_approval(expense_id: int, admin_id: int, decision: str, db=Depends(get_db)):
    """
    Admin override an approval decision.
    """
    try:
        result = ApprovalEngine.override_approval(db, expense_id, admin_id, decision)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))