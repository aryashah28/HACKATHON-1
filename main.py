from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import Base, engine
from routes import auth_routes, expense_routes, approval_routes, rule_routes, user_routes
import models.user
import models.company
import models.expense
import models.approval
import models.approval_rule
import models.ocr_data

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API is running 🚀"}

# ✅ Create all tables
Base.metadata.create_all(bind=engine)

# ✅ Include routers
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(user_routes.router, prefix="/users", tags=["Users"])
app.include_router(expense_routes.router, prefix="/expense", tags=["Expense"])
app.include_router(approval_routes.router, prefix="/approval", tags=["Approval"])
app.include_router(rule_routes.router, prefix="/rules", tags=["Rules"])
