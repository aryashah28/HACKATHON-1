from sqlalchemy import Column, Integer, Float, String
from database.db import Base

class Expense(Base):
    tablename = "expenses"
    id = Column(Integer, primary_key=True)
    amount = Column(Float)
    currency = Column(String)
    category = Column(String)
    description = Column(String)
    status = Column(String, default="pending")
    user_id = Column(Integer)