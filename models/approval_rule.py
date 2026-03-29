from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from database.db import Base
from datetime import datetime

class ApprovalRule(Base):
    __tablename__ = "approval_rules"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String)  # e.g., "Expenses under $1000", "Default Rule"
    amount_threshold = Column(Float, nullable=True)  # Min amount for this rule
    rule_type = Column(String)  # "percentage", "specific_approver", "sequential"
    percentage_required = Column(Float, nullable=True)  # e.g., 60 for 60% approval
    specific_approver_id = Column(Integer, nullable=True)  # For auto-approval by specific user (e.g., CFO)
    requires_manager = Column(Boolean, default=True)  # Must manager approve first?
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ApprovalSequence(Base):
    __tablename__ = "approval_sequences"
    id = Column(Integer, primary_key=True)
    rule_id = Column(Integer, ForeignKey("approval_rules.id"))
    approver_id = Column(Integer, ForeignKey("users.id"))
    sequence_order = Column(Integer)  # 1st, 2nd, 3rd approver
    created_at = Column(DateTime, default=datetime.utcnow)
