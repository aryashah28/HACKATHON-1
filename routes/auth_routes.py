<<<<<<< HEAD
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
=======
﻿from fastapi import APIRouter, Depends, HTTPException
from database.db import get_db
from schemas.user_schema import UserLogin, TokenResponse
from services.auth_service import signup, login

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=TokenResponse)
def signup_user(data: UserLogin, db=Depends(get_db)):
    token = signup(db, data.username, data.password)
    return {"access_token": token}

@router.post("/login", response_model=TokenResponse)
def login_user(data: UserLogin, db=Depends(get_db)):
    token = login(db, data.username, data.password)
    if token is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": token}
>>>>>>> c169234c3f65b38868bf57b9d3df052830158a08
