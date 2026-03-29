from fastapi import FastAPI
from database.db import Base, engine

from routes import auth_routes, expense_routes, approval_routes, rule_routes, user_routes

app = FastAPI()

#✅ Tables create
Base.metadata.create_all(bind=engine)

# ✅ Routers include
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(user_routes.router, prefix="/users", tags=["Users"])
app.include_router(expense_routes.router, prefix="/expense", tags=["Expense"])
app.include_router(approval_routes.router, prefix="/approval", tags=["Approval"])
app.include_router(rule_routes.router, prefix="/rules", tags=["Rules"])

@app.get("/")
def home():
    return {"message": "API is running 🚀"}