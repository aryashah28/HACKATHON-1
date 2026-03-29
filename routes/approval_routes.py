from fastapi import APIRouter, Depends, HTTPException
from database.db import get_db
from models.approval import Approval
from models.expense import Expense
from services.approval_engine import evaluate

router = APIRouter()

@router.post("/approve")
def approve(approval_id: int, decision: str, db=Depends(get_db)):
    
    # ✅ approval fetch
    a = db.query(Approval).get(approval_id)

    # ❗ FIX 1: approval check
    if not a:
        raise HTTPException(status_code=404, detail="Approval not found")

    # update approval status
    a.status = decision
    db.commit()

    # fetch expense
    exp = db.query(Expense).get(a.expense_id)

    # ❗ FIX 2: expense check
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")

    # update expense status
    if decision == "rejected":
        exp.status = "rejected"
    else:
        exp.status = evaluate(db, exp.id)

    db.commit()

    return {
        "approval_status": a.status,
        "expense_status": exp.status
    }