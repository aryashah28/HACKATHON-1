from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.user import User
from schemas.user_schema import UserCreate, UserResponse
from utils.security import hash_password

router = APIRouter(prefix="/users", tags=["Users"])


# ---------------- CREATE USER ---------------- #
@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    existing = db.query(User).filter_by(username=user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Validate manager if provided
    if user.manager_id:
        manager = db.query(User).get(user.manager_id)
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")
        if manager.role != "manager":
            raise HTTPException(status_code=400, detail="Assigned manager must have role 'manager'")

    # Create user
    new_user = User(
        username=user.username,
        password=hash_password(user.password),
        role=user.role,
        manager_id=user.manager_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ---------------- GET ALL USERS ---------------- #
@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# ---------------- GET SINGLE USER ---------------- #
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ---------------- UPDATE USER ---------------- #
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, updated: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate manager again if updated
    if updated.manager_id:
        manager = db.query(User).get(updated.manager_id)
        if not manager or manager.role != "manager":
            raise HTTPException(status_code=400, detail="Invalid manager")

    user.username = updated.username
    user.password = hash_password(updated.password)
    user.role = updated.role
    user.manager_id = updated.manager_id

    db.commit()
    db.refresh(user)

    return user


# ---------------- DELETE USER ---------------- #
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"msg": "User deleted"}