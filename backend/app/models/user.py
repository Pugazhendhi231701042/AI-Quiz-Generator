import datetime
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="owner", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="owner", cascade="all, delete-orphan")
