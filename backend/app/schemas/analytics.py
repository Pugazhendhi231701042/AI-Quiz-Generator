from typing import List, Dict, Optional
from pydantic import BaseModel

class TopicPerformance(BaseModel):
    topic: str
    accuracy_percentage: float
    total_answered: int
    correct_count: int
    status: str  # Strong, Average, Weak

class RecommendationItem(BaseModel):
    topic: str
    reason: str
    suggested_difficulty: str
    suggested_question_count: int
    suggested_flashcard_count: int

class AnalyticsSummaryResponse(BaseModel):
    total_quizzes_taken: int
    average_score: float
    total_questions_answered: int
    strong_topics: List[str]
    weak_topics: List[str]
    topic_breakdown: List[TopicPerformance]
    recommendations: List[RecommendationItem]
