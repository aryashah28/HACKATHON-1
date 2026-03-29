from models.user import User
from utils.security import hash_password, verify_password, create_token

def signup(db, username, password):
    user = User(username=username, password=hash_password(password), role="admin")
    db.add(user)
    db.commit()
    return create_token({"user": user.id})

def login(db, username, password):
    user = db.query(User).filter_by(username=username).first()
    if not user or not verify_password(password, user.password):
        return None
    return create_token({"user": user.id})