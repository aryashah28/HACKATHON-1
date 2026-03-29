from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from database.db import Base
from datetime import datetime

class OCRData(Base):
    __tablename__ = "ocr_data"
    id = Column(Integer, primary_key=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=True)
    receipt_path = Column(String)  # Path to uploaded receipt image
    extracted_amount = Column(Float, nullable=True)
    extracted_date = Column(DateTime, nullable=True)
    extracted_merchant = Column(String, nullable=True)  # Restaurant/shop name
    extracted_category = Column(String, nullable=True)
    extracted_description = Column(Text, nullable=True)
    extracted_items = Column(Text, nullable=True)  # JSON of expense lines
    confidence_score = Column(Float, default=0.0)  # OCR confidence (0-1)
    raw_ocr_text = Column(Text, nullable=True)  # Raw OCR output
    processed = Column(Integer, default=0)  # 0: pending, 1: completed, 2: needs_manual_review
    created_at = Column(DateTime, default=datetime.utcnow)
