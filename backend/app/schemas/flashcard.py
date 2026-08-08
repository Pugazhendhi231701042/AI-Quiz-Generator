from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class FlashcardGenerateRequest(BaseModel):
    document_id: int
    topic: Optional[str] = None
    count: int = Field(default=10, ge=1, le=30)

class FlashcardResponse(BaseModel):
    id: int
    user_id: int
    document_id: int
    front: str
    back: str
    category: str
    topic: str
    is_mastered: bool
    created_at: datetime

    class Config:
        from_attributes = True

class FlashcardUpdateStatus(BaseModel):
    is_mastered: bool
