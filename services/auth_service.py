from models.user import User
from models.company import Company
from utils.security import hash_password, verify_password, create_token

def signup(db, username, password, role="employee", country=None, currency="USD", company_name=None):
    """Register a new user with role-based setup"""
    
    # Check if user exists
    existing_user = db.query(User).filter_by(username=username).first()
    if existing_user:
        raise ValueError("User already exists")
    
    # For admin signup, create a company
    company = None
    is_company_admin = False
    if role == "admin":
        if not company_name:
            company_name = f"{username}'s Company"
        company = Company(name=company_name, country=country, currency=currency)
        db.add(company)
        db.flush()  # Flush to get company.id before committing
        is_company_admin = True
    
    # Create user
    user = User(
        username=username,
        password=hash_password(password),
        role=role,
        country=country,
        currency=currency,
        company_id=company.id if company else None,
        is_company_admin=is_company_admin
    )
    db.add(user)
    db.commit()
    
    token = create_token({"user_id": user.id, "role": user.role, "username": user.username})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "country": user.country,
            "currency": user.currency,
            "company_id": user.company_id,
            "is_company_admin": user.is_company_admin
        }
    }


def login(db, username, password):
    """Authenticate user and return token"""
    user = db.query(User).filter_by(username=username).first()
    if not user or not verify_password(password, user.password):
        return None
    
    token = create_token({"user_id": user.id, "role": user.role, "username": user.username})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "country": user.country,
            "currency": user.currency,
            "company_id": user.company_id,
            "is_company_admin": user.is_company_admin
        }
    }