from fastapi import FastAPI
from database.db import Base, engine

from routes import auth_routes, expense_routes, approval_routes, rule_routes

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_routes.router)
app.include_router(expense_routes.router)
app.include_router(approval_routes.router)
app.include_router(rule_routes.router)