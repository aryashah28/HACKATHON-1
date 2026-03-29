from models.expense import Expense
from models.approval import Approval
from models.user import User

def create_expense(db, data):
    exp = Expense(**data.dict())
    db.add(exp)
    db.commit()
    db.refresh(exp)

    user = db.query(User).get(data.user_id)
    if user.manager_id:
        db.add(Approval(expense_id=exp.id, approver_id=user.manager_id, step=1))
        db.commit()

    return exp