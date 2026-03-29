from fastapi import APIRouter, Depends, HTTPException
from database.db import get_db
from schemas.user_schema import UserLogin, UserRegister, TokenResponse
from services.auth_service import signup, login

router = APIRouter()

@router.post("/signup", response_model=TokenResponse)
def signup_user(data: UserRegister, db=Depends(get_db)):
    """Register new user with role (admin/manager/employee)"""
    try:
        result = signup(
            db, 
            data.username, 
            data.password,
            role=data.role,
            country=data.country,
            currency=data.currency,
            company_name=data.company_name
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login_user(data: UserLogin, db=Depends(get_db)):
    """Login user and return token with user info"""
    result = login(db, data.username, data.password)
    if result is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result
