from pydantic import BaseModel

class ExpenseCreate(BaseModel):
    amount: float
    currency: str
    category: str
    description: str
    user_id: int