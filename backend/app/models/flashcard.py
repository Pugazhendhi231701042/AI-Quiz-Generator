import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    front = Column(String, nullable=False)  # Question, term, concept
    back = Column(String, nullable=False)   # Answer, definition, explanation
    category = Column(String, default="Concept")  # Definition, Concept, Question, Formula
    topic = Column(String, nullable=False)
    is_mastered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="flashcards")
    document = relationship("Document", back_populates="flashcards")
