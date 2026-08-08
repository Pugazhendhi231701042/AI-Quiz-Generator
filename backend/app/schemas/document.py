from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_type: str
    file_size: int
    status: str
    error_message: Optional[str] = None
    chunk_count: int
    detected_topics: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentAnalysisResponse(BaseModel):
    document_id: int
    filename: str
    detected_topics: List[str]
    total_chunks: int
