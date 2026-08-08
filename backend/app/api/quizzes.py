from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.exceptions import NotFoundException, BadRequestException
from app.models.user import User
from app.models.document import Document
from app.models.quiz import Quiz, QuizAttempt, UserAnswer
from app.models.question import Question
from app.schemas.quiz import QuizGenerateRequest, QuizSubmitRequest, QuizResponse, QuizAttemptResponse
from app.api.auth import get_current_user
from app.services.generator.quiz_generator import QuizGenerator

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.post("/generate", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(
    req: QuizGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify user owns document
    result = await db.execute(
        select(Document).where(Document.id == req.document_id, Document.user_id == current_user.id)
    )
    doc = result.scalars().first()
    if not doc:
        raise NotFoundException("Document not found")

    if doc.status != "completed":
        raise BadRequestException(f"Document is currently in status '{doc.status}'. Please wait for extraction to complete.")

    # Generate questions using RAG & Gemini
    generated_q_list = QuizGenerator.generate_quiz_questions(
        document_id=doc.id,
        filename=doc.filename,
        question_count=req.question_count,
        difficulty=req.difficulty,
        question_types=req.question_types,
        selected_topics=req.selected_topics
    )

    if not generated_q_list:
        raise BadRequestException("Failed to generate questions. Document may not have sufficient readable text.")

    # Create Quiz ORM record
    quiz_title = f"{doc.filename.split('.')[0]} - {req.difficulty.capitalize()} Quiz"
    new_quiz = Quiz(
        user_id=current_user.id,
        document_id=doc.id,
        title=quiz_title,
        difficulty=req.difficulty,
        mode=req.mode,
        question_count=len(generated_q_list),
        time_limit_minutes=req.time_limit_minutes,
        selected_topics=req.selected_topics
    )
    db.add(new_quiz)
    await db.commit()
    await db.refresh(new_quiz)

    # Create Question ORM records
    db_questions = []
    for q_item in generated_q_list:
        question = Question(
            document_id=doc.id,
            quiz_id=new_quiz.id,
            type=q_item.get("type", "mcq"),
            question=q_item.get("question", ""),
            options=q_item.get("options", []),
            correct_answer=str(q_item.get("correct_answer", "")),
            explanation=q_item.get("explanation", ""),
            difficulty=q_item.get("difficulty", "medium"),
            topic=q_item.get("topic", "General"),
            source_reference=q_item.get("source_reference", {})
        )
        db.add(question)
        db_questions.append(question)

    await db.commit()

    # Re-query quiz with preloaded questions
    res = await db.execute(
        select(Quiz).options(selectinload(Quiz.questions)).where(Quiz.id == new_quiz.id)
    )
    full_quiz = res.scalars().first()
    return full_quiz

@router.get("", response_model=List[QuizResponse])
async def list_quizzes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.user_id == current_user.id)
        .order_by(Quiz.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.id == quiz_id, Quiz.user_id == current_user.id)
    )
    quiz = result.scalars().first()
    if not quiz:
        raise NotFoundException("Quiz not found")
    return quiz

@router.post("/{quiz_id}/submit", response_model=QuizAttemptResponse)
async def submit_quiz_attempt(
    quiz_id: int,
    submit_req: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions))
        .where(Quiz.id == quiz_id, Quiz.user_id == current_user.id)
    )
    quiz = result.scalars().first()
    if not quiz:
        raise NotFoundException("Quiz not found")

    q_map = {q.id: q for q in quiz.questions}
    correct_count = 0
    topic_correct: Dict[str, int] = {}
    topic_total: Dict[str, int] = {}
    user_results = []

    user_answers_to_db = []

    for ans_item in submit_req.answers:
        q_obj = q_map.get(ans_item.question_id)
        if not q_obj:
            continue

        topic = q_obj.topic or "General"
        topic_total[topic] = topic_total.get(topic, 0) + 1

        u_ans_clean = ans_item.user_answer.strip().lower()
        c_ans_clean = q_obj.correct_answer.strip().lower()

        # Check correctness - empty answers must NEVER pass as correct
        is_correct = False
        if u_ans_clean:
            if u_ans_clean == c_ans_clean:
                is_correct = True
            elif q_obj.type == "fill_in_blank":
                # For fill in blank, check non-empty overlap (min 2 chars)
                if len(u_ans_clean) >= 2 and (u_ans_clean in c_ans_clean or c_ans_clean in u_ans_clean):
                    is_correct = True

        if is_correct:
            correct_count += 1
            topic_correct[topic] = topic_correct.get(topic, 0) + 1

        user_answers_to_db.append({
            "question_id": q_obj.id,
            "user_answer": ans_item.user_answer,
            "is_correct": is_correct,
            "time_taken_seconds": ans_item.time_taken_seconds
        })

        user_results.append({
            "question_id": q_obj.id,
            "question_text": q_obj.question,
            "user_answer": ans_item.user_answer,
            "correct_answer": q_obj.correct_answer,
            "is_correct": is_correct,
            "explanation": q_obj.explanation,
            "source_reference": q_obj.source_reference or {}
        })

    total_q = len(quiz.questions)
    score_percentage = int((correct_count / total_q * 100)) if total_q > 0 else 0

    topic_performance = {}
    for top, tot in topic_total.items():
        cor = topic_correct.get(top, 0)
        topic_performance[top] = round((cor / tot * 100), 1)

    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=current_user.id,
        score=score_percentage,
        correct_count=correct_count,
        total_questions=total_q,
        time_taken_seconds=submit_req.total_time_seconds
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)

    for ua in user_answers_to_db:
        db.add(UserAnswer(
            attempt_id=attempt.id,
            question_id=ua["question_id"],
            user_answer=ua["user_answer"],
            is_correct=ua["is_correct"],
            time_taken_seconds=ua["time_taken_seconds"]
        ))
    await db.commit()

    return {
        "attempt_id": attempt.id,
        "quiz_id": quiz.id,
        "score": score_percentage,
        "correct_count": correct_count,
        "total_questions": total_q,
        "time_taken_seconds": submit_req.total_time_seconds,
        "completed_at": attempt.completed_at,
        "topic_performance": topic_performance,
        "results": user_results
    }
