from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SourceReference(BaseModel):
    document_name: str
    page_number: Optional[int] = None
    section: Optional[str] = None
    chunk_id: str
    source_text: Optional[str] = None

class QuestionBase(BaseModel):
    type: str = Field(..., description="mcq, true_false, fill_in_blank")
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str
    difficulty: str = Field(..., description="easy, medium, hard")
    topic: str
    source_reference: SourceReference

class QuestionCreate(QuestionBase):
    document_id: int
    quiz_id: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: int
    document_id: int
    quiz_id: Optional[int] = None

    class Config:
        from_attributes = True
