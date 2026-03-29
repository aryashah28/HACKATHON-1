
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from database.db import get_db
from models.user import User
from models.company import Company
from services.auth_service import signup, login, get_country_currency
from services.ocr_service import extract_receipt_data
from sqlalchemy.orm import Session

router = APIRouter()

# Schemas
class SignupRequest(BaseModel):
    username: str
    password: str
    role: str = "employee"  # admin, manager, employee
    country: str
    company_name: str | None = None

class LoginRequest(BaseModel):
    username: str
    password: str

class CreateEmployeeRequest(BaseModel):
    username: str
    password: str
    role: str = "employee"
    manager_id: int | None = None

# OCR Endpoint
@router.post("/extract_receipt")
async def extract_receipt(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Extract expense data from receipt using OCR"""
    try:
        result = await extract_receipt_data(file)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OCR extraction failed: {str(e)}")

# Auth Endpoints
@router.post("/signup")
def signup_user(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Signup endpoint - Auto-creates Company and Admin User
    Admin can then create employees and managers
    """
    try:
        # Check if user already exists
        existing_user = db.query(User).filter_by(username=request.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        result = signup(db, request.username, request.password, request.role, request.country, request.company_name)
        
        # Flatten response for frontend
        return {
            "token": result["token"],
            "user_id": result["user"]["id"],
            "username": result["user"]["username"],
            "role": result["user"]["role"],
            "company_id": result["user"]["company_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint"""
    result = login(db, request.username, request.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Flatten response for frontend
    return {
        "token": result["token"],
        "user_id": result["user"]["id"],
        "username": result["user"]["username"],
        "role": result["user"]["role"],
        "company_id": result["user"]["company_id"]
    }

# Admin endpoints
@router.post("/create_employee")
def create_employee(request: CreateEmployeeRequest, admin_id: int, db: Session = Depends(get_db)):
    """Admin creates employee or manager"""
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create users")
    
    # Check if user exists
    existing = db.query(User).filter_by(username=request.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    from utils.security import hash_password
    
    new_user = User(
        username=request.username,
        password=hash_password(request.password),
        role=request.role,
        company_id=admin.company_id,
        manager_id=request.manager_id,
        is_manager_approver=(request.role == "manager")
    )
    db.add(new_user)
    db.commit()
    
    return {
        "message": f"{request.role.capitalize()} created successfully",
        "user_id": new_user.id,
        "username": new_user.username
    }

@router.put("/assign_manager/{user_id}")
def assign_manager(user_id: int, manager_id: int, admin_id: int, db: Session = Depends(get_db)):
    """Admin assigns manager to employee"""
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can assign managers")
    
    employee = db.query(User).get(user_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    manager = db.query(User).get(manager_id)
    if not manager or manager.role != "manager":
        raise HTTPException(status_code=404, detail="Manager not found")
    
    employee.manager_id = manager_id
    db.commit()
    
    return {"message": f"Manager assigned to {employee.username}"}
