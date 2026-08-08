import pytest
from app.services.document.extractor import ExtractedSection
from app.services.rag.chunker import StructureAwareChunker

def test_structure_aware_chunker():
    sections = [
        ExtractedSection(
            text="Operating Systems manage hardware resources. " * 30,
            page_number=1,
            section_title="Overview"
        ),
        ExtractedSection(
            text="Memory Management involves physical RAM allocation. " * 25,
            page_number=2,
            section_title="Memory Management"
        )
    ]

    chunker = StructureAwareChunker(target_chunk_size_words=50, overlap_words=10)
    chunks = chunker.create_chunks(sections, document_id=101, filename="os_notes.pdf")

    assert len(chunks) >= 2
    assert chunks[0].document_id == 101
    assert chunks[0].filename == "os_notes.pdf"
    assert chunks[0].page_number == 1
    assert chunks[0].section == "Overview"
    assert "Operating Systems" in chunks[0].content
