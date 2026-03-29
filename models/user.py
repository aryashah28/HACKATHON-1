from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database.db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="employee")  # admin, manager, employee
    country = Column(String, nullable=True)
    currency = Column(String, default="USD")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    manager_id = Column(Integer, nullable=True)
    is_company_admin = Column(Boolean, default=False)