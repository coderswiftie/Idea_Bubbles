from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Validates JWT token and retrieves the current authenticated user.
    If no token is provided, creates or returns a default local demo user
    to allow instant out-of-the-box local usage without forced logins,
    while still enforcing full multi-user isolation when tokens are used.
    """
    if token:
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_id = payload["sub"]
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Seamless Local Development / Guest User
    # Check if default local user exists, or create one
    demo_email = "explorer@ideabubbles.universe"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        from app.core.security import get_password_hash
        user = User(
            email=demo_email,
            hashed_password=get_password_hash("midnightuniverse"),
            display_name="Cosmic Explorer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
