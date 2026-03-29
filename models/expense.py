from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Boolean
from database.db import Base
from datetime import datetime

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="USD")
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, manager_approved, approved, rejected
    user_id = Column(Integer, ForeignKey("users.id"))
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    rule_id = Column(Integer, ForeignKey("approval_rules.id"), nullable=True)
    ocr_data_id = Column(Integer, ForeignKey("ocr_data.id"), nullable=True)
    receipt_path = Column(String, nullable=True)
    expense_date = Column(DateTime, nullable=True)
    merchant_name = Column(String, nullable=True)  # From OCR
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)