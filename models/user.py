from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="employee")  # admin, manager, employee
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_manager_approver = Column(Boolean, default=False)  # Can this manager approve?
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="users")
    manager = relationship("User", remote_side=[id], backref="subordinates")
    expenses = relationship("Expense", back_populates="user")
    approvals = relationship("Approval", back_populates="approver")