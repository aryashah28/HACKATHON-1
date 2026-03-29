from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    amount_in_company_currency = Column(Float, nullable=True)  # Converted amount
    category = Column(String)
    description = Column(String)
    expense_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")  # pending, approved, rejected
    expense_lines = Column(JSON, nullable=True)  # For OCR extracted lines
    receipt_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    requires_manager_approval = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="expenses")
    company = relationship("Company", back_populates="expenses")
    approvals = relationship("Approval", back_populates="expense")