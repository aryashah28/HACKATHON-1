from fastapi import APIRouter, Depends
from database.db import get_db
from models.approval import Approval
from models.expense import Expense
from services.approval_engine import evaluate

router = APIRouter()

@router.post("/approve")
def approve(approval_id: int, decision: str, db=Depends(get_db)):
    a = db.query(Approval).get(approval_id)
    a.status = decision
    db.commit()

    exp = db.query(Expense).get(a.expense_id)
    if decision == "rejected":
        exp.status = "rejected"
    else:
        exp.status = evaluate(db, exp.id)

    db.commit()
    return exp.status