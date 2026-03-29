from fastapi import APIRouter, Depends
from database.db import get_db
from models.rule import Rule

router = APIRouter()

@router.post("/rules")
def add_rule(type: str, value: float = 0, approver_id: int = None, db=Depends(get_db)):
    r = Rule(type=type, value=value, approver_id=approver_id)
    db.add(r)
    db.commit()
    return {"msg": "rule added"}