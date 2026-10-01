import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.auth import hash_password, verify_password, create_access_token
from jose import jwt
from app.config import settings

def test_password_hashing():
    pw = "SecretDoctorPass2026!"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_generation():
    data = {"sub": "dr_sharma", "role": "DOCTOR"}
    token = create_access_token(data)
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == "dr_sharma"
    assert decoded["role"] == "DOCTOR"

if __name__ == "__main__":
    test_password_hashing()
    test_jwt_token_generation()
    print("ALL AUTH TESTS PASSED.")
