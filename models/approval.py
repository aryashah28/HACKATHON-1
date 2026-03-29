from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False, index=True)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    approval_rule_id = Column(Integer, ForeignKey("approval_rules.id"), nullable=True)
    step = Column(Integer, default=1)  # Step in approval chain
    status = Column(String, default="pending")  # pending, approved, rejected
    decision_type = Column(String, nullable=True)  # specific_approver, percentage, hybrid
    comments = Column(String, nullable=True)
    decided_at = Column(DateTime, nullable=True)
    is_current = Column(Boolean, default=True)  # Is this the current approval step?
    created_at = Column(DateTime, default=datetime.utcnow)
    
    expense = relationship("Expense", back_populates="approvals")
    approver = relationship("User", back_populates="approvals")
    approval_rule = relationship("ApprovalRule")