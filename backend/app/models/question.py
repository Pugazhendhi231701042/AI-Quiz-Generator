import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(String, nullable=False)  # mcq, true_false, fill_in_blank
    question = Column(String, nullable=False)
    options = Column(JSON, nullable=True)  # ["A", "B", "C", "D"] for MCQ
    correct_answer = Column(String, nullable=False)
    explanation = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)  # easy, medium, hard
    topic = Column(String, nullable=False)
    source_reference = Column(JSON, nullable=False)  # {"document_name": "...", "page_number": 3, "section": "...", "chunk_id": "..."}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="questions")
    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("UserAnswer", back_populates="question", cascade="all, delete-orphan")
