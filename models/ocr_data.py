from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class OCRData(Base):
    __tablename__ = "ocr_data"
    
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=True, index=True)
    extracted_text = Column(JSON)
    extracted_data = Column(JSON, nullable=True)  # {amount, date, description, items, merchant}
    confidence_score = Column(Float)
    processed_at = Column(DateTime, default=datetime.utcnow)
    
    expense = relationship("Expense", backref="ocr_data")
