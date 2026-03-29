from sqlalchemy import Column, Integer, String
from database.db import Base

class Approval(Base):
    tablename = "approvals"
    id = Column(Integer, primary_key=True)
    expense_id = Column(Integer)
    approver_id = Column(Integer)
    status = Column(String, default="pending")
    step = Column(Integer)