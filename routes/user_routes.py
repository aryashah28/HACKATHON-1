from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.db import get_db
from models.user import User
from models.company import Company
from schemas.user_schema import UserCreate, UserResponse
from utils.security import hash_password

router = APIRouter(tags=["Users"])

class ChangeRoleRequest(BaseModel):
    new_role: str

class AssignManagerRequest(BaseModel):
    manager_id: int

@router.get("/company/{company_id}")
def get_company_users(company_id: int, admin_id: int, db: Session = Depends(get_db)):
    """Admin views all users in their company"""
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin" or admin.company_id != company_id:
        raise HTTPException(status_code=403, detail="Only admins can view company users")
    
    users = db.query(User).filter_by(company_id=company_id).all()
    
    return {
        "total": len(users),
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "role": u.role,
                "manager_id": u.manager_id,
                "is_manager_approver": u.is_manager_approver,
                "created_at": u.created_at
            }
            for u in users
        ]
    }

@router.put("/{user_id}/change_role")
def change_user_role(user_id: int, request: ChangeRoleRequest, admin_id: int, db: Session = Depends(get_db)):
    """Admin changes user role"""
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can change roles")
    
    user = db.query(User).get(user_id)
    if not user or user.company_id != admin.company_id:
        raise HTTPException(status_code=404, detail="User not found in your company")
    
    if request.new_role not in ["admin", "manager", "employee"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user.role = request.new_role
    db.commit()
    
    return {
        "user_id": user_id,
        "new_role": request.new_role,
        "message": f"User role changed to {request.new_role}"
    }

@router.put("/{user_id}/assign_manager")
def assign_manager(user_id: int, request: AssignManagerRequest, admin_id: int, db: Session = Depends(get_db)):
    """Admin assigns a manager to an employee"""
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can assign managers")
    
    user = db.query(User).get(user_id)
    if not user or user.company_id != admin.company_id:
        raise HTTPException(status_code=404, detail="User not found in your company")
    
    manager = db.query(User).get(request.manager_id)
    if not manager or manager.company_id != admin.company_id or manager.role != "manager":
        raise HTTPException(status_code=400, detail="Invalid manager")
    
    user.manager_id = request.manager_id
    db.commit()
    
    return {
        "user_id": user_id,
        "manager_id": request.manager_id,
        "message": "Manager assigned successfully"
    }

@router.delete("/{user_id}")
def delete_user(user_id: int, admin_id: int, db: Session = Depends(get_db)):
    """Admin deletes a user from company"""
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    
    user = db.query(User).get(user_id)
    if not user or user.company_id != admin.company_id:
        raise HTTPException(status_code=404, detail="User not found in your company")
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user_id} deleted"}

# Legacy endpoints (keep for backward compatibility)
@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter_by(username=user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    if user.manager_id:
        manager = db.query(User).get(user.manager_id)
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")
        if manager.role != "manager":
            raise HTTPException(status_code=400, detail="Assigned manager must have role 'manager'")

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

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user