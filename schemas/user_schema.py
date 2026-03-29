from pydantic import BaseModel, Field
from typing import Optional


#---------------- REQUEST SCHEMAS ----------------
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(admin|manager|employee)$")
    country: Optional[str] = None
    currency: Optional[str] = "USD"
    company_name: Optional[str] = None  # Only for admin signup
    manager_id: Optional[int] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(admin|manager|employee)$")
    country: str
    currency: str = "USD"
    company_name: Optional[str] = None  # For admin signup


#---------------- RESPONSE SCHEMAS ---------------
class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    country: Optional[str]
    currency: str
    company_id: Optional[int]
    manager_id: Optional[int]
    is_company_admin: bool

    class Config:
        from_attributes = True   # for SQLAlchemy compatibility


class UserDetailResponse(BaseModel):
    id: int
    username: str
    role: str
    country: Optional[str]
    currency: str
    company_id: Optional[int]
    manager_id: Optional[int]
    is_company_admin: bool

    class Config:
        from_attributes = True


#---------------- TOKEN SCHEMA ----------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None