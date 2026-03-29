from fastapi import APIRouter, UploadFile, File, Depends
from database.db import get_db
from models.user import User
from sqlalchemy.orm import Session

router = APIRouter()

def extract(file):
    return {
        "amount": 100,
        "description": "Auto OCR",
        "date": "2025-01-01"
    }

@router.post("/extract")
async def extract_data(file: UploadFile = File(...)):
    result = extract(file)
    return result


# 🔥 NEW API (users create)
@router.get("/create-users")
def create_users(db: Session = Depends(get_db)):
    
    existing = db.query(User).filter(User.id == 1).first()
    if existing:
        return {"message": "Users already exist ⚠️"}

    manager = User(
        id=2,
        username="manager",
        password="123",
        role="manager",
        manager_id=None
    )

    employee = User(
        id=1,
        username="samarth",
        password="123",
        role="employee",
        manager_id=2
    )

    db.add(manager)
    db.add(employee)
    db.commit()

    return {"message": "Users created successfully ✅"}