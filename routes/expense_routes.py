from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database.db import get_db
from models.expense import Expense
from models.user import User
from services.expense_service import (
    create_expense,
    get_employee_expenses,
    get_pending_approvals,
    get_company_expenses
)
from sqlalchemy.orm import Session
from datetime import datetime

router = APIRouter()

class ExpenseCreateRequest(BaseModel):
    amount: float
    currency: str
    category: str
    description: str
    expense_date: datetime | None = None

@router.post("/expense")
def add_expense(request: ExpenseCreateRequest, user_id: int, company_id: int, db: Session = Depends(get_db)):
    """Employee submits expense claim"""
    try:
        user = db.query(User).get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        result = create_expense(
            db,
            user_id=user_id,
            company_id=company_id if company_id else user.company_id,
            amount=request.amount,
            currency=request.currency,
            category=request.category,
            description=request.description,
            expense_date=request.expense_date
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-expenses")
def get_my_expenses(user_id: int, db: Session = Depends(get_db)):
    """Employee views their expense history"""
    expenses = get_employee_expenses(db, user_id, user_id)
    
    return {
        "expenses": [
            {
                "id": e.id,
                "amount": e.amount,
                "currency": e.currency,
                "category": e.category,
                "description": e.description,
                "status": e.status,
                "created_at": e.created_at
            }
            for e in expenses
        ]
    }

@router.get("/pending_approvals")
def get_pending_for_approval(approver_id: int, company_id: int, db: Session = Depends(get_db)):
    """Manager/Admin views expenses waiting for approval"""
    approvals = get_pending_approvals(db, approver_id, company_id)
    
    return {
        "pending": [
            {
                "approval_id": a.id,
                "expense_id": a.expense_id,
                "amount": a.expense.amount_in_company_currency,
                "company_currency": a.expense.company.currency,
                "category": a.expense.category,
                "description": a.expense.description,
                "submitted_date": a.expense.created_at,
                "step": a.step,
                "status": a.status
            }
            for a in approvals
        ]
    }

@router.post("/approve")
def approve_expense(approval_id: int, decision: str, comments: str = None, db: Session = Depends(get_db)):
    """Manager/Admin approves or rejects expense"""
    from models.approval import Approval
    from services.approval_engine import move_to_next_approval
    
    if decision not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Decision must be 'approved' or 'rejected'")
    
    approval = db.query(Approval).get(approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    approval.status = decision
    approval.comments = comments
    approval.decided_at = datetime.utcnow()
    
    move_to_next_approval(db, approval.expense, approval.approver_id, decision)
    
    return {
        "message": f"Expense {decision}",
        "expense_id": approval.expense_id
    }

@router.get("/company-expenses")
def get_all_company_expenses(company_id: int, admin_id: int, db: Session = Depends(get_db)):
    """Admin views all company expenses"""
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all expenses")
    
    expenses = get_company_expenses(db, company_id)
    
    return {
        "total": len(expenses),
        "expenses": [
            {
                "id": e.id,
                "user_id": e.user_id,
                "amount": e.amount_in_company_currency,
                "currency": e.company.currency,
                "category": e.category,
                "status": e.status,
                "created_at": e.created_at
            }
            for e in expenses
        ]
    }

@router.get("/expense/{expense_id}")
def get_expense_detail(expense_id: int, db: Session = Depends(get_db)):
    """Get detailed expense information with approval chain"""
    from models.approval import Approval
    
    expense = db.query(Expense).get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    approvals = db.query(Approval).filter_by(expense_id=expense_id).all()
    
    return {
        "expense": {
            "id": expense.id,
            "amount": expense.amount,
            "currency": expense.currency,
            "amount_in_company_currency": expense.amount_in_company_currency,
            "category": expense.category,
            "description": expense.description,
            "status": expense.status,
            "created_at": expense.created_at
        },
        "approval_chain": [
            {
                "step": a.step,
                "approver_id": a.approver_id,
                "status": a.status,
                "comments": a.comments,
                "decided_at": a.decided_at
            }
            for a in approvals
        ]
    }