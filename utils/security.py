import bcrypt
from jose import jwt

SECRET = "secret"

def hash_password(p):
    return bcrypt.hashpw(p.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(p, h):
    return bcrypt.checkpw(p.encode('utf-8'), h.encode('utf-8'))

def create_token(data):
    return jwt.encode(data, SECRET, algorithm="HS256")