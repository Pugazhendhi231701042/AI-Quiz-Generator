from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.core.exceptions import UnauthorizedException, BadRequestException
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    email = decode_access_token(token)
    if not email:
        raise UnauthorizedException("Invalid authentication token")
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise UnauthorizedException("User not found")
    return user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise BadRequestException("User with this email already exists")

    hashed_pw = get_password_hash(user_in.password)
    user = User(name=user_in.name, email=user_in.email, password_hash=hashed_pw)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise BadRequestException("Incorrect email or password")

    access_token = create_access_token(subject=user.email)
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
