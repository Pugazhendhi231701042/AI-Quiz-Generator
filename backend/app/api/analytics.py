from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.user import User
from app.models.quiz import QuizAttempt, UserAnswer
from app.models.question import Question
from app.schemas.analytics import AnalyticsSummaryResponse, TopicPerformance, RecommendationItem
from app.api.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsSummaryResponse)
async def get_analytics_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch all attempts for user
    res = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.completed_at.desc())
    )
    attempts = res.scalars().all()

    total_quizzes = len(attempts)
    if total_quizzes == 0:
        return AnalyticsSummaryResponse(
            total_quizzes_taken=0,
            average_score=0.0,
            total_questions_answered=0,
            strong_topics=[],
            weak_topics=[],
            topic_breakdown=[],
            recommendations=[
                RecommendationItem(
                    topic="Getting Started",
                    reason="Upload a study document and take your first quiz to generate topic analytics!",
                    suggested_difficulty="medium",
                    suggested_question_count=10,
                    suggested_flashcard_count=5
                )
            ]
        )

    total_score_sum = sum(a.score for a in attempts)
    average_score = round(total_score_sum / total_quizzes, 1)
    total_q_answered = sum(a.total_questions for a in attempts)

    # Calculate per-topic performance across all user answers
    ans_query = await db.execute(
        select(UserAnswer, Question)
        .join(Question, UserAnswer.question_id == Question.id)
        .join(QuizAttempt, UserAnswer.attempt_id == QuizAttempt.id)
        .where(QuizAttempt.user_id == current_user.id)
    )
    ans_records = ans_query.all()

    topic_correct: Dict[str, int] = {}
    topic_total: Dict[str, int] = {}

    for ua, q in ans_records:
        t = q.topic or "General"
        topic_total[t] = topic_total.get(t, 0) + 1
        if ua.is_correct:
            topic_correct[t] = topic_correct.get(t, 0) + 1

    topic_breakdown: List[TopicPerformance] = []
    strong_topics: List[str] = []
    weak_topics: List[str] = []
    recommendations: List[RecommendationItem] = []

    for t, tot in topic_total.items():
        cor = topic_correct.get(t, 0)
        acc = round((cor / tot * 100), 1)

        if acc >= 75.0:
            status_str = "Strong"
            strong_topics.append(t)
        elif acc >= 60.0:
            status_str = "Average"
        else:
            status_str = "Weak"
            weak_topics.append(t)
            recommendations.append(RecommendationItem(
                topic=t,
                reason=f"Accuracy is low ({acc}% across {tot} questions). Practice recommended.",
                suggested_difficulty="medium" if acc >= 40 else "easy",
                suggested_question_count=10,
                suggested_flashcard_count=5
            ))

        topic_breakdown.append(TopicPerformance(
            topic=t,
            accuracy_percentage=acc,
            total_answered=tot,
            correct_count=cor,
            status=status_str
        ))

    if not recommendations and weak_topics:
        for wt in weak_topics:
            recommendations.append(RecommendationItem(
                topic=wt,
                reason="Focus on reviewing key definitions and foundational concepts.",
                suggested_difficulty="easy",
                suggested_question_count=8,
                suggested_flashcard_count=5
            ))

    return AnalyticsSummaryResponse(
        total_quizzes_taken=total_quizzes,
        average_score=average_score,
        total_questions_answered=total_q_answered,
        strong_topics=strong_topics,
        weak_topics=weak_topics,
        topic_breakdown=topic_breakdown,
        recommendations=recommendations
    )
