import re
from datetime import datetime
import json
from typing import Dict, Any, Optional

class OCRService:
    """
    Service to extract expense information from receipt images using OCR.
    In production, this could integrate with Google Cloud Vision, AWS Textract, or pytesseract.
    """

    @staticmethod
    def extract_expense_from_receipt(ocr_text: str, confidence: float = 0.8) -> Dict[str, Any]:
        """
        Parse OCR text from receipt and extract structured expense data.
        
        Args:
            ocr_text: Raw text extracted from receipt image
            confidence: Confidence score for OCR (0-1)
        
        Returns:
            Dictionary with extracted fields: amount, date, merchant, category, description, items
        """
        extracted = {
            "amount": None,
            "currency": "USD",
            "merchant_name": None,
            "date": None,
            "category": None,
            "description": None,
            "items": [],
            "confidence_score": confidence,
            "raw_text": ocr_text
        }

        if not ocr_text or not ocr_text.strip():
            return extracted

        lines = ocr_text.split('\n')
        
        # Extract merchant name (usually at the top or in bold)
        extracted["merchant_name"] = OCRService._extract_merchant(lines)
        
        # Extract amount (look for currency symbols and numbers)
        extracted["amount"] = OCRService._extract_amount(ocr_text)
        
        # Extract currency if specified
        if "$" in ocr_text:
            extracted["currency"] = "USD"
        elif "£" in ocr_text:
            extracted["currency"] = "GBP"
        elif "€" in ocr_text:
            extracted["currency"] = "EUR"
        elif "₹" in ocr_text:
            extracted["currency"] = "INR"
        
        # Extract date
        extracted["date"] = OCRService._extract_date(ocr_text)
        
        # Extract category based on merchant or keywords
        extracted["category"] = OCRService._extract_category(extracted["merchant_name"], ocr_text)
        
        # Extract line items
        extracted["items"] = OCRService._extract_line_items(lines)
        
        # Generate description
        extracted["description"] = f"Receipt from {extracted['merchant_name']}" if extracted["merchant_name"] else "Receipt"
        
        return extracted

    @staticmethod
    def _extract_merchant(lines: list) -> Optional[str]:
        """Extract merchant/store name, usually at the beginning"""
        for line in lines[:5]:  # Check first 5 lines
            cleaned = line.strip()
            if cleaned and len(cleaned) > 3 and len(cleaned) < 100:
                # Avoid common OCR artifacts and header text
                if not any(keyword in cleaned.lower() for keyword in ['total', 'subtotal', 'tax', 'amount', 'date', 'time']):
                    return cleaned
        return None

    @staticmethod
    def _extract_amount(text: str) -> Optional[float]:
        """Extract the total amount/total cost from receipt text"""
        # Look for patterns like: Total: $XX.XX, Amount: XX.XX
        patterns = [
            r'total\s*[:\s]+\$?([\d,]+\.?\d*)',
            r'[:\s]+\$?([\d,]+\.?\d*)\s*(?:USD|EUR|GBP|INR)?$',
            r'[A-Z]+\s+\$?([\d,]+\.?\d*)',
        ]
        
        text_lower = text.lower()
        for pattern in patterns:
            matches = re.findall(pattern, text_lower, re.MULTILINE)
            if matches:
                # Get the last match (usually the total)
                amount_str = matches[-1].replace(',', '')
                try:
                    return float(amount_str)
                except ValueError:
                    continue
        return None

    @staticmethod
    def _extract_date(text: str) -> Optional[str]:
        """Extract date from receipt"""
        # Common date patterns
        patterns = [
            r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',  # DD/MM/YYYY or MM/DD/YYYY
            r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})',    # YYYY/MM/DD
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return None

    @staticmethod
    def _extract_category(merchant: str, text: str) -> Optional[str]:
        """Classify expense category based on merchant name or keywords"""
        merchant_lower = (merchant or "").lower()
        text_lower = text.lower()
        
        categories = {
            "Meals": ["restaurant", "cafe", "coffee", "pizza", "burger", "food", "dinner", "lunch", "breakfast", "bistro", "bar"],
            "Travel": ["hotel", "airline", "taxi", "uber", "railway", "train", "gas station", "parking", "flight"],
            "Office": ["office", "supplies", "stationery", "printer", "paper"],
            "General": ["store", "mall", "shop"]
        }
        
        combined_text = merchant_lower + " " + text_lower
        
        for category, keywords in categories.items():
            if any(kw in combined_text for kw in keywords):
                return category
        
        return "General"

    @staticmethod
    def _extract_line_items(lines: list) -> list:
        """Extract individual line items from receipt"""
        items = []
        
        for line in lines:
            # Look for lines with item descriptions and prices
            # Pattern: "Item Name    $X.XX" or "Item Name $X.XX"
            if "$" in line or "£" in line or "€" in line:
                match = re.match(r'^(.+?)\s+[\$£€]?([\d,]+\.?\d*)\s*$', line.strip())
                if match and len(match.group(1)) > 2:
                    items.append({
                        "description": match.group(1),
                        "amount": float(match.group(2).replace(',', ''))
                    })
        
        return items[:10]  # Limit to first 10 items


# Mock function for testing receipt upload
def process_receipt_image(file_path: str) -> Dict[str, Any]:
    """
    Process a receipt image and extract expense information.
    In production, this would call actual OCR service (pytesseract, Google Vision, etc.)
    
    Args:
        file_path: Path to the receipt image
    
    Returns:
        Dictionary with extracted expense data
    """
    # In a real implementation, you'd use:
    # - pytesseract for local processing
    # - Google Cloud Vision API
    # - AWS Textract
    # - Azure Computer Vision
    
    # For now, return a sample structure
    return {
        "amount": None,
        "currency": "USD",
        "merchant_name": None,
        "date": None,
        "category": None,
        "description": None,
        "items": [],
        "confidence_score": 0.0,
        "status": "pending_ocr_implementation"
    }
 
