from sqlalchemy import Column, Integer, String
from database.db import Base

class Company(Base):
    tablename = "companies"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    currency = Column(String)