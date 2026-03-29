from models.expense import Expense
from models.approval import Approval
from models.user import User

def create_expense(db, data):
    exp = Expense(**data.dict())
    db.add(exp)
    db.commit()
    db.refresh(exp)

    user = db.query(User).get(data.user_id)

    approval_id = None  # 👈 new

    if user and user.manager_id:
        approval = Approval(
            expense_id=exp.id,
            approver_id=user.manager_id,
            step=1
        )
        db.add(approval)
        db.commit()
        db.refresh(approval)

        approval_id = approval.id  # 👈 store id

    return {
        "expense_id": exp.id,
        "approval_id": approval_id,
        "message": "Expense created successfully"
    }