from models.approval import Approval
from models.rule import Rule

def evaluate(db, expense_id):
    approvals = db.query(Approval).filter_by(expense_id=expense_id).all()
    rules = db.query(Rule).all()

    approved = [a for a in approvals if a.status == "approved"]

    for r in rules:
        if r.type == "percentage":
            if len(approved)/len(approvals) >= r.value:
                return "approved"

        if r.type == "specific":
            if any(a.approver_id == r.approver_id and a.status=="approved" for a in approvals):
                return "approved"

        if r.type == "hybrid":
            if len(approved)/len(approvals) >= r.value or \
            any(a.approver_id == r.approver_id and a.status=="approved" for a in approvals):
                return "approved"

    return "pending"