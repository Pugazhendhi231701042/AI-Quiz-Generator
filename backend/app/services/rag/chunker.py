import uuid
from typing import List, Dict, Any
from app.services.document.extractor import ExtractedSection

class DocumentChunk:
    def __init__(
        self,
        chunk_id: str,
        document_id: int,
        filename: str,
        content: str,
        page_number: int,
        section: str,
        topic: str = "General"
    ):
        self.chunk_id = chunk_id
        self.document_id = document_id
        self.filename = filename
        self.content = content
        self.page_number = page_number
        self.section = section
        self.topic = topic

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "filename": self.filename,
            "content": self.content,
            "page_number": self.page_number,
            "section": self.section,
            "topic": self.topic,
        }

class StructureAwareChunker:
    """
    Structure-aware chunker that splits document sections into 500-800 token chunks
    with 50-100 token overlap, maintaining page numbers and section headers.
    """
    def __init__(self, target_chunk_size_words: int = 600, overlap_words: int = 75):
        self.target_chunk_size = target_chunk_size_words
        self.overlap = overlap_words

    def create_chunks(
        self,
        sections: List[ExtractedSection],
        document_id: int,
        filename: str
    ) -> List[DocumentChunk]:
        chunks: List[DocumentChunk] = []

        for sec in sections:
            words = sec.text.split()
            if not words:
                continue

            if len(words) <= self.target_chunk_size:
                chunk_id = f"chunk_{document_id}_{sec.page_number}_{uuid.uuid4().hex[:8]}"
                chunks.append(DocumentChunk(
                    chunk_id=chunk_id,
                    document_id=document_id,
                    filename=filename,
                    content=sec.text,
                    page_number=sec.page_number,
                    section=sec.section_title
                ))
            else:
                start = 0
                while start < len(words):
                    end = min(start + self.target_chunk_size, len(words))
                    chunk_words = words[start:end]
                    chunk_text = " ".join(chunk_words)
                    
                    chunk_id = f"chunk_{document_id}_{sec.page_number}_{uuid.uuid4().hex[:8]}"
                    chunks.append(DocumentChunk(
                        chunk_id=chunk_id,
                        document_id=document_id,
                        filename=filename,
                        content=chunk_text,
                        page_number=sec.page_number,
                        section=sec.section_title
                    ))
                    
                    if end >= len(words):
                        break
                    start += (self.target_chunk_size - self.overlap)

        return chunks
