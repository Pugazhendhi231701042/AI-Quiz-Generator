import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db, AsyncSessionLocal
from app.core.exceptions import NotFoundException, BadRequestException
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.api.auth import get_current_user

from app.services.document.extractor import DocumentExtractor
from app.services.rag.chunker import StructureAwareChunker
from app.services.rag.vector_store import vector_store
from app.services.generator.analyzer import DocumentAnalyzer

router = APIRouter(prefix="/documents", tags=["Documents"])

async def process_document_background(document_id: int, file_path: str, file_type: str, filename: str):
    """
    Background Task: Extract Text → Clean → Structure-Aware Chunking → Qdrant Vector Storage → Topic Analysis
    """
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Document).where(Document.id == document_id))
        doc = result.scalars().first()
        if not doc:
            return

        try:
            # 1. Extract Text Sections
            sections = DocumentExtractor.extract_text(file_path, file_type)
            
            # 2. Chunking
            chunker = StructureAwareChunker(target_chunk_size_words=600, overlap_words=75)
            chunks = chunker.create_chunks(sections, document_id, filename)

            # 3. Store Chunks in Qdrant Vector Store
            vector_store.add_chunks(chunks)

            # 4. Content Analysis & Topic Detection
            chunks_content = [c.content for c in chunks]
            detected_topics = DocumentAnalyzer.analyze_document(chunks_content)

            # Update Document Model
            doc.status = "completed"
            doc.chunk_count = len(chunks)
            doc.detected_topics = detected_topics
            await db.commit()

        except Exception as e:
            print(f"[Document Processing Error] doc_id={document_id}: {e}")
            doc.status = "failed"
            doc.error_message = str(e)
            await db.commit()

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower().replace(".", "")
    if ext not in ["pdf", "docx", "pptx", "txt", "md"]:
        raise BadRequestException(f"Unsupported file format: .{ext}. Supported: PDF, DOCX, PPTX, TXT, MD.")

    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    new_doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_type=ext,
        file_size=file_size,
        file_path=file_path,
        status="processing",
        detected_topics=[]
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    # Launch non-blocking background processing task
    background_tasks.add_task(
        process_document_background,
        new_doc.id,
        file_path,
        ext,
        file.filename
    )

    return new_doc

@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document)
        .where(Document.id == document_id, Document.user_id == current_user.id)
    )
    doc = result.scalars().first()
    if not doc:
        raise NotFoundException("Document not found")
    return doc

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document)
        .where(Document.id == document_id, Document.user_id == current_user.id)
    )
    doc = result.scalars().first()
    if not doc:
        raise NotFoundException("Document not found")

    # Delete Qdrant vectors
    try:
        vector_store.delete_document_chunks(document_id)
    except Exception as e:
        print(f"[Vector Delete Error] doc_id={document_id}: {e}")

    # Remove file from disk
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except OSError:
            pass

    await db.delete(doc)
    await db.commit()
