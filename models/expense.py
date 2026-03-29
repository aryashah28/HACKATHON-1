from sqlalchemy import Column, Integer, Float, String
from database.db import Base

class Expense(Base):
<<<<<<< HEAD
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True)
    amount = Column(Float)
    currency = Column(String)
=======
    __tablename__ = "expenses"   # ✅ double underscore

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
>>>>>>> 1fd2bb7 (initial commit)
    category = Column(String)
    description = Column(String)
    status = Column(String, default="pending")
    user_id = Column(Integer)