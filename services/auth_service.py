from models.user import User
from models.company import Company
from utils.security import hash_password, verify_password, create_token
import requests

def get_country_currency(country_code):
    """Fetch currency for a country using REST Countries API"""
    try:
        response = requests.get(f"https://restcountries.com/v3.1/alpha/{country_code}")
        if response.status_code == 200:
            country = response.json()[0]
            currencies = country.get("currencies", {})
            if currencies:
                # Get first currency
                currency_code = list(currencies.keys())[0]
                return currency_code
    except:
        pass
    return "USD"  # Default fallback

def signup(db, username, password, role, country, company_name=None):
    """Create company and admin user on first signup"""
    # Get currency for country
    currency = get_country_currency(country)
    
    # Create company (only once for first admin)
    company = Company(
        name=company_name or f"{username}'s Company",
        country=country,
        currency=currency
    )
    db.add(company)
    db.flush()  # Get company ID
    
    # Create admin user for company
    user = User(
        username=username,
        password=hash_password(password),
        role=role,  # admin, manager, employee
        company_id=company.id,
        is_manager_approver=(role == "manager" or role == "admin")
    )
    db.add(user)
    db.commit()
    
    return {
        "token": create_token({"user": user.id, "company": company.id}),
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "company_id": company.id
        }
    }

def login(db, username, password):
    """Login user"""
    user = db.query(User).filter_by(username=username).first()
    if not user or not verify_password(password, user.password):
        return None
    return {
        "token": create_token({"user": user.id, "company": user.company_id}),
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "company_id": user.company_id
        }
    }