from sqlalchemy import Column, Integer, Float, String
from database.db import Base

class Rule(Base):
    tablename = "rules"
    id = Column(Integer, primary_key=True)
    type = Column(String)
    value = Column(Float)
    approver_id = Column(Integer, nullable=True)