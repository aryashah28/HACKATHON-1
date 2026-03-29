from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database.db import get_db
from models.approval_rule import ApprovalRule
from models.user import User
from sqlalchemy.orm import Session
from typing import List

router = APIRouter()

class ApprovalRuleRequest(BaseModel):
    rule_type: str  # "percentage", "specific_approver", "hybrid"
    percentage_required: float | None = None
    specific_approver_id: int | None = None
    approver_sequence: List[int] | None = None

@router.post("/")
def create_approval_rule(request: ApprovalRuleRequest, company_id: int, admin_id: int, db: Session = Depends(get_db)):
    """Admin creates new approval rule for company"""
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin" or admin.company_id != company_id:
        raise HTTPException(status_code=403, detail="Only admins can create rules")
    
    if request.rule_type == "percentage" and not request.percentage_required:
        raise HTTPException(status_code=400, detail="Percentage required for percentage rule")
    
    if request.rule_type == "specific_approver" and not request.specific_approver_id:
        raise HTTPException(status_code=400, detail="Specific approver ID required")
    
    if request.rule_type == "hybrid" and (not request.percentage_required or not request.approver_sequence):
        raise HTTPException(status_code=400, detail="Percentage and approver sequence required for hybrid rule")
    
    rule = ApprovalRule(
        company_id=company_id,
        rule_type=request.rule_type,
        percentage_required=request.percentage_required,
        specific_approver_id=request.specific_approver_id,
        approver_sequence=request.approver_sequence
    )
    
    db.add(rule)
    db.commit()
    
    return {
        "rule_id": rule.id,
        "message": f"{request.rule_type} approval rule created"
    }

@router.get("/{company_id}")
def get_company_rules(company_id: int, db: Session = Depends(get_db)):
    """Get all approval rules for a company"""
    rules = db.query(ApprovalRule).filter_by(company_id=company_id).all()
    
    return {
        "total": len(rules),
        "rules": [
            {
                "id": r.id,
                "rule_type": r.rule_type,
                "percentage_required": r.percentage_required,
                "specific_approver_id": r.specific_approver_id,
                "approver_sequence": r.approver_sequence,
                "created_at": r.created_at
            }
            for r in rules
        ]
    }

@router.put("/{rule_id}")
def update_approval_rule(rule_id: int, request: ApprovalRuleRequest, admin_id: int, db: Session = Depends(get_db)):
    """Admin updates an approval rule"""
    rule = db.query(ApprovalRule).get(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin" or admin.company_id != rule.company_id:
        raise HTTPException(status_code=403, detail="Only admins can update rules")
    
    rule.rule_type = request.rule_type
    rule.percentage_required = request.percentage_required
    rule.specific_approver_id = request.specific_approver_id
    rule.approver_sequence = request.approver_sequence
    
    db.commit()
    
    return {
        "rule_id": rule.id,
        "message": "Approval rule updated"
    }

@router.delete("/{rule_id}")
def delete_approval_rule(rule_id: int, admin_id: int, db: Session = Depends(get_db)):
    """Admin deletes an approval rule"""
    rule = db.query(ApprovalRule).get(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    admin = db.query(User).get(admin_id)
    if not admin or admin.role != "admin" or admin.company_id != rule.company_id:
        raise HTTPException(status_code=403, detail="Only admins can delete rules")
    
    db.delete(rule)
    db.commit()
    
    return {"message": f"Rule {rule_id} deleted"}