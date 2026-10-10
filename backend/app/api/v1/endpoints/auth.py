from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.api.deps import get_current_user, get_db
from app.models.user import User

router = APIRouter()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: int
    role: str
    full_name: str


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    age: int
    gender: str
    role: str = "patient"


class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    age: int | None
    gender: str | None


@router.post("/login", response_model=TokenResponse, summary="OAuth 2.0 Password Login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Standard OAuth2 password login conforming to IEEE 830 FR-1 & FR-2.
    Queries the database, verifies salted bcrypt hash, and issues a JWT token.
    """
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=str(user.id),
        role=user.role,
        expires_delta=access_token_expires
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name
    }


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Register a new patient account in PostgreSQL/SQLite database."""
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists in the registry."
        )

    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        age=user_in.age,
        gender=user_in.gender
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "message": "User registered successfully in database",
        "user_id": new_user.id,
        "email": new_user.email,
        "role": new_user.role
    }


@router.get("/me", response_model=UserProfileResponse, summary="Current Authenticated User Profile")
async def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """Retrieve identity of currently logged-in user directly from database."""
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        age=current_user.age,
        gender=current_user.gender
    )
