from fastapi import APIRouter, Depends
from database.db import get_db
from schemas.expense_schema import ExpenseCreate
from services.expense_service import create_expense

router = APIRouter()

@router.post("/expense")
def add_expense(data: ExpenseCreate, db=Depends(get_db)):
    return create_expense(db, data)