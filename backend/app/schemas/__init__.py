from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.schemas.document import DocumentResponse, DocumentAnalysisResponse
from app.schemas.question import QuestionBase, QuestionCreate, QuestionResponse, SourceReference
from app.schemas.quiz import QuizGenerateRequest, QuizSubmitRequest, QuizResponse, QuizAttemptResponse
from app.schemas.flashcard import FlashcardGenerateRequest, FlashcardResponse, FlashcardUpdateStatus
from app.schemas.analytics import AnalyticsSummaryResponse, TopicPerformance, RecommendationItem

__all__ = [
    "UserRegister", "UserLogin", "Token", "UserResponse",
    "DocumentResponse", "DocumentAnalysisResponse",
    "QuestionBase", "QuestionCreate", "QuestionResponse", "SourceReference",
    "QuizGenerateRequest", "QuizSubmitRequest", "QuizResponse", "QuizAttemptResponse",
    "FlashcardGenerateRequest", "FlashcardResponse", "FlashcardUpdateStatus",
    "AnalyticsSummaryResponse", "TopicPerformance", "RecommendationItem"
]
