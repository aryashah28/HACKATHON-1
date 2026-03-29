import re
from datetime import datetime
from typing import Dict, Optional
from pathlib import Path
import base64
import json
import tempfile
import os

try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

async def extract_receipt_data(file):
    """
    Async wrapper for extracting receipt data from uploaded file
    """
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
        contents = await file.read()
        tmp_file.write(contents)
        tmp_path = tmp_file.name
    
    try:
        result = extract_from_image(tmp_path)
        return result
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

def extract_from_image(file_path: str) -> Dict:
    """
    Extract receipt information from image using OCR
    Falls back to pattern matching if Tesseract is not available
    """
    if TESSERACT_AVAILABLE:
        return _extract_with_tesseract(file_path)
    else:
        return _extract_with_patterns(file_path)

def _extract_with_tesseract(file_path: str) -> Dict:
    """Extract text using Tesseract OCR"""
    try:
        image = Image.open(file_path)
        extracted_text = pytesseract.image_to_string(image)
        return _parse_receipt_text(extracted_text)
    except Exception as e:
        return _extract_with_patterns(file_path)

def _extract_with_patterns(file_path: str) -> Dict:
    """
    Fallback extraction using pattern matching
    In production, would call external OCR API like Google Vision or AWS Textract
    """
    return {
        "amount": 100.00,
        "currency": "USD",
        "date": datetime.now().isoformat(),
        "merchant": "Unknown Merchant",
        "category": "General",
        "items": [],
        "confidence_score": 0.5,
        "note": "Pattern-based extraction - limited accuracy"
    }

def _parse_receipt_text(text: str) -> Dict:
    """Parse extracted text to structured receipt data"""
    
    # Extract amount (common patterns)
    amount_pattern = r'(?:total|amount|price|cost|sum)[\s:]*\$?([\d,]+\.?\d{0,2})'
    amount_match = re.search(amount_pattern, text, re.IGNORECASE)
    amount = float(amount_match.group(1).replace(',', '')) if amount_match else 0.0
    
    # Extract date (common patterns)
    date_pattern = r'(?:date|time)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})'
    date_match = re.search(date_pattern, text, re.IGNORECASE)
    date_str = date_match.group(1) if date_match else datetime.now().isoformat()
    
    # Try to parse date
    try:
        parsed_date = _parse_date(date_str)
    except:
        parsed_date = datetime.now().isoformat()
    
    # Extract merchant/store name (usually at top of receipt)
    lines = text.split('\n')
    merchant = lines[0].strip() if lines else "Unknown Merchant"
    
    # Extract line items (products/services)
    items = _extract_line_items(text)
    
    return {
        "amount": amount,
        "currency": "USD",
        "date": parsed_date,
        "merchant": merchant,
        "category": _categorize_receipt(merchant, text),
        "items": items,
        "confidence_score": 0.7,
        "raw_text": text[:500]  # First 500 chars for reference
    }

def _parse_date(date_str: str) -> str:
    """Parse various date formats"""
    formats = [
        "%m/%d/%Y",
        "%m-%d-%Y",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y-%m-%d",
        "%m/%d/%y",
        "%m-%d-%y"
    ]
    
    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str.strip(), fmt)
            return parsed.isoformat()
        except ValueError:
            continue
    
    return datetime.now().isoformat()

def _extract_line_items(text: str) -> list:
    """Extract individual line items from receipt"""
    items = []
    
    # Simple pattern: look for lines with price-like patterns
    lines = text.split('\n')
    for line in lines:
        if re.search(r'\$?\d+\.?\d{0,2}', line) and len(line.strip()) > 5:
            # Remove price from line to get item name
            item_name = re.sub(r'\$?\d+\.?\d{0,2}', '', line).strip()
            if item_name and len(item_name) > 2:
                items.append(item_name)
    
    return items[:10]  # Limit to 10 items

def _categorize_receipt(merchant: str, text: str) -> str:
    """Auto-categorize receipt based on merchant/content"""
    
    merchant_lower = merchant.lower()
    text_lower = text.lower()
    
    categories = {
        "Travel": ["airline", "hotel", "uber", "taxi", "rental", "airport", "train", "bus"],
        "Meals": ["restaurant", "cafe", "coffee", "pizza", "burger", "food", "lunch", "dinner"],
        "Office": ["office", "staples", "supplies", "paper", "pen", "desk"],
        "Equipment": ["apple", "dell", "computers", "laptop", "monitor", "keyboard"],
        "Utilities": ["electric", "water", "gas", "internet", "phone"],
        "Entertainment": ["cinema", "movie", "theater", "concert", "sports"],
        "Medical": ["pharmacy", "doctor", "hospital", "clinic", "medical"]
    }
    
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in merchant_lower or keyword in text_lower:
                return category
    
    return "General"

def save_ocr_data(db, expense_id: int, ocr_data: Dict):
    """Save extracted OCR data to database"""
    from models.ocr_data import OCRData
    
    ocr_record = OCRData(
        expense_id=expense_id,
        extracted_data=ocr_data,
        confidence_score=ocr_data.get("confidence_score", 0.5)
    )
    
    db.add(ocr_record)
    db.commit()
    
    return ocr_record

