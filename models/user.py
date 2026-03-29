from sqlalchemy import Column, Integer, String
from database.db import Base

class User(Base):
    tablename = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password = Column(String)
    role = Column(String)
    manager_id = Column(Integer, nullable=True)