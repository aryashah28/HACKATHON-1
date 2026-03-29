from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from database.db import Base
from datetime import datetime

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(Integer, primary_key=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    approver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")  # pending, approved, rejected
    step = Column(Integer)  # Sequence order (1 = first approver, 2 = second, etc)
    rule_id = Column(Integer, ForeignKey("approval_rules.id"), nullable=True)
    comments = Column(String, nullable=True)
    is_manager_approval = Column(Boolean, default=False)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)