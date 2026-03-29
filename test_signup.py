from database.db import SessionLocal, Base, engine
from models.user import User
from models.company import Company
from models.expense import Expense
from models.approval import Approval
from models.approval_rule import ApprovalRule
from models.ocr_data import OCRData
from services.auth_service import signup
import random
import string

def test_signup():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Initialise session
    db = SessionLocal()
    
    # Generate unique username
    username = "test_user_" + "".join(random.choices(string.ascii_letters, k=5))
    password = "password123"
    role = "admin"
    country = "US"
    company_name = "Tech Solutions Inc"
    
    print(f"Signing up {username} with company {company_name}...")
    
    try:
        result = signup(db, username, password, role, country, company_name)
        
        # Verify
        user_id = result["user"]["id"]
        company_id = result["user"]["company_id"]
        
        saved_company = db.query(Company).get(company_id)
        saved_user = db.query(User).get(user_id)
        
        print(f"Company ID: {saved_company.id}, Name: {saved_company.name}")
        print(f"User ID: {saved_user.id}, Username: {saved_user.username}, Company ID: {saved_user.company_id}")
        
        assert saved_company.name == company_name
        assert saved_user.company_id == saved_company.id
        print("Test PASSED: Company name is correctly saved to database.")
        
    except Exception as e:
        print(f"Test FAILED: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    test_signup()
