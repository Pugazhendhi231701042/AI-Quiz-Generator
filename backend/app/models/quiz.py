import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)  # easy, medium, hard, mixed
    mode = Column(String, default="practice")  # practice, exam, timed
    question_count = Column(Integer, nullable=False)
    time_limit_minutes = Column(Integer, nullable=True)  # for timed mode
    selected_topics = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    score = Column(Integer, nullable=False)  # percentage 0-100
    correct_count = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    time_taken_seconds = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    quiz = relationship("Quiz", back_populates="attempts")
    user = relationship("User", back_populates="quiz_attempts")
    user_answers = relationship("UserAnswer", back_populates="attempt", cascade="all, delete-orphan")

class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    user_answer = Column(String, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    time_taken_seconds = Column(Integer, default=0)

    attempt = relationship("QuizAttempt", back_populates="user_answers")
    question = relationship("Question", back_populates="answers")
