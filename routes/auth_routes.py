from fastapi import APIRouter, Depends, HTTPException
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
