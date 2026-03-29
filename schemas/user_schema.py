from pydantic import BaseModel, Field
from typing import Optional


---------------- REQUEST SCHEMAS ----------------
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(admin|manager|employee)$")
    manager_id: Optional[int] = None


class UserLogin(BaseModel):
    username: str
    password: str


---------------- RESPONSE SCHEMAS ----------------
class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    manager_id: Optional[int]

    class Config:
        from_attributes = True   # for SQLAlchemy compatibility


---------------- TOKEN SCHEMA ----------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"