from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class ApprovalRule(Base):
    __tablename__ = "approval_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String, index=True)
    rule_type = Column(String)  # percentage, specific_approver, hybrid
    threshold_amount = Column(Float, nullable=True)  # Min amount to trigger rule
    percentage_required = Column(Float, nullable=True)  # e.g., 0.60 for 60%
    specific_approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # CFO, etc
    approver_sequence = Column(JSON, nullable=True)  # [{step: 1, role: "manager"}, ...]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="approval_rules")
    specific_approver = relationship("User", foreign_keys=[specific_approver_id])
