import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx, pptx, txt, md
    file_size = Column(Integer, nullable=False)  # bytes
    file_path = Column(String, nullable=False)
    status = Column(String, default="processing")  # processing, completed, failed
    error_message = Column(String, nullable=True)
    chunk_count = Column(Integer, default=0)
    detected_topics = Column(JSON, default=list)  # ["Process Management", "Memory Management"]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="documents")
    questions = relationship("Question", back_populates="document", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="document", cascade="all, delete-orphan")
