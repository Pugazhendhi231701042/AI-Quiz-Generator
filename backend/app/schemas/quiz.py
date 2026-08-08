from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.question import QuestionResponse

class QuizGenerateRequest(BaseModel):
    document_id: int
    question_count: int = Field(default=10, ge=1, le=50)
    difficulty: str = Field(default="mixed", description="easy, medium, hard, mixed")
    question_types: List[str] = Field(default=["mcq", "true_false", "fill_in_blank"])
    selected_topics: List[str] = Field(default=[])
    mode: str = Field(default="practice", description="practice, exam, timed")
    time_limit_minutes: Optional[int] = Field(default=15)

class UserAnswerItem(BaseModel):
    question_id: int
    user_answer: str
    time_taken_seconds: int = 0

class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: List[UserAnswerItem]
    total_time_seconds: int = 0

class UserAnswerResult(BaseModel):
    question_id: int
    question_text: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str
    source_reference: Dict[str, Any]

class QuizAttemptResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    score: int
    correct_count: int
    total_questions: int
    time_taken_seconds: int
    completed_at: datetime
    topic_performance: Dict[str, float]
    results: List[UserAnswerResult]

class QuizResponse(BaseModel):
    id: int
    user_id: int
    document_id: int
    title: str
    difficulty: str
    mode: str
    question_count: int
    time_limit_minutes: Optional[int]
    selected_topics: List[str]
    created_at: datetime
    questions: Optional[List[QuestionResponse]] = None

    class Config:
        from_attributes = True
