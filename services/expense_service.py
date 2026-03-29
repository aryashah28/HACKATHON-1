from models.expense import Expense
from models.approval import Approval
from models.user import User
from models.company import Company
from services.approval_engine import create_approval_workflow
from services.currency_service import convert_currency
from datetime import datetime

def create_expense(db, user_id, company_id, amount, currency, category, description, expense_date=None):
    """Create expense with automatic approval workflow"""
    
    # Get company to fetch default currency
    company = db.query(Company).get(company_id)
    if not company:
        raise ValueError("Company not found")
    
    # Convert amount to company currency if different
    amount_in_company_currency = amount
    if currency != company.currency:
        try:
            amount_in_company_currency = convert_currency(amount, currency, company.currency)
        except:
            # Fallback to original amount if conversion fails
            amount_in_company_currency = amount
    
    # Create expense
    expense = Expense(
        user_id=user_id,
        company_id=company_id,
        amount=amount,
        currency=currency,
        amount_in_company_currency=amount_in_company_currency,
        category=category,
        description=description,
        expense_date=expense_date or datetime.utcnow(),
        status="pending"
    )
    db.add(expense)
    db.flush()  # Get expense ID
    
    # Create approval workflow
    create_approval_workflow(db, expense, company_id)
    db.commit()
    
    return {
        "expense_id": expense.id,
        "amount_converted": amount_in_company_currency,
        "company_currency": company.currency,
        "message": "Expense created successfully with approval workflow"
    }

def get_employee_expenses(db, user_id, company_id):
    """Get all expenses for an employee"""
    return db.query(Expense).filter_by(
        user_id=user_id,
        company_id=company_id
    ).order_by(Expense.created_at.desc()).all()

def get_pending_approvals(db, approver_id, company_id):
    """Get expenses pending approval for a manager"""
    return db.query(Approval).join(Expense).filter(
        Approval.approver_id == approver_id,
        Approval.is_current == True,
        Approval.status == "pending",
        Expense.company_id == company_id
    ).order_by(Approval.created_at.desc()).all()

def get_company_expenses(db, company_id):
    """Get all expenses for a company (admin view)"""
    return db.query(Expense).filter_by(
        company_id=company_id
    ).order_by(Expense.created_at.desc()).all()