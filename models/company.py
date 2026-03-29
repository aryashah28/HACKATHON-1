from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    country = Column(String)
    currency = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship("User", back_populates="company")
    expenses = relationship("Expense", back_populates="company")
    approval_rules = relationship("ApprovalRule", back_populates="company")