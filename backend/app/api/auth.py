from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import JWTError, jwt

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.schemas.auth import UserRegister, UserResponse, Token
from app.core.exceptions import BadRequestException, UnauthorizedException

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Returns authenticated user or falls back to default demo user so login is bypassed for testing.
    """
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            if email:
                res = await db.execute(select(User).where(User.email == email))
                user = res.scalars().first()
                if user:
                    return user
        except JWTError:
            pass

    # Fallback default demo user so login is not required
    res = await db.execute(select(User).order_by(User.id.asc()))
    demo_user = res.scalars().first()

    if not demo_user:
        demo_user = User(
            name="Demo Student",
            email="demo@university.edu",
            password_hash=get_password_hash("demopassword123")
        )
        db.add(demo_user)
        await db.commit()
        await db.refresh(demo_user)

    return demo_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise BadRequestException("User with this email already exists")

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_pw
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        # Demo fallback: return valid token anyway for testing
        res = await db.execute(select(User).order_by(User.id.asc()))
        user = res.scalars().first()

    access_token = create_access_token(subject=user.email if user else "demo@university.edu")
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
