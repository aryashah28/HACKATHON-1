from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database.db import Base
from datetime import datetime

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    currency = Column(String, default="USD")
    country = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)