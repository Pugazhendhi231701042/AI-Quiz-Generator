from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.exceptions import NotFoundException, BadRequestException
from app.models.user import User
from app.models.document import Document
from app.models.flashcard import Flashcard
from app.schemas.flashcard import FlashcardGenerateRequest, FlashcardResponse, FlashcardUpdateStatus
from app.api.auth import get_current_user
from app.services.generator.flashcard_generator import FlashcardGenerator

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])

@router.post("/generate", response_model=List[FlashcardResponse], status_code=status.HTTP_201_CREATED)
async def generate_flashcards(
    req: FlashcardGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.id == req.document_id, Document.user_id == current_user.id)
    )
    doc = result.scalars().first()
    if not doc:
        raise NotFoundException("Document not found")

    generated_cards = FlashcardGenerator.generate_flashcards(
        document_id=doc.id,
        topic=req.topic,
        count=req.count
    )

    db_flashcards = []
    for card_item in generated_cards:
        fc = Flashcard(
            user_id=current_user.id,
            document_id=doc.id,
            front=card_item.get("front", ""),
            back=card_item.get("back", ""),
            category=card_item.get("category", "Concept"),
            topic=card_item.get("topic", req.topic or "General"),
            is_mastered=False
        )
        db.add(fc)
        db_flashcards.append(fc)

    await db.commit()
    for fc in db_flashcards:
        await db.refresh(fc)

    return db_flashcards

@router.get("", response_model=List[FlashcardResponse])
async def list_flashcards(
    document_id: int = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Flashcard).where(Flashcard.user_id == current_user.id)
    if document_id:
        query = query.where(Flashcard.document_id == document_id)
    
    result = await db.execute(query.order_by(Flashcard.created_at.desc()))
    return result.scalars().all()

@router.patch("/{flashcard_id}", response_model=FlashcardResponse)
async def update_flashcard_status(
    flashcard_id: int,
    status_update: FlashcardUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Flashcard).where(Flashcard.id == flashcard_id, Flashcard.user_id == current_user.id)
    )
    fc = result.scalars().first()
    if not fc:
        raise NotFoundException("Flashcard not found")

    fc.is_mastered = status_update.is_mastered
    await db.commit()
    await db.refresh(fc)
    return fc
