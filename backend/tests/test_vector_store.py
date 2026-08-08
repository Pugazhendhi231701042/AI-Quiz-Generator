import pytest
from qdrant_client import QdrantClient
from app.services.rag.chunker import DocumentChunk
from app.services.rag.vector_store import SimpleEmbedder, QdrantVectorStore

def test_simple_embedder():
    v1 = SimpleEmbedder.get_embedding("virtual memory paging frames")
    v2 = SimpleEmbedder.get_embedding("virtual memory paging frames")
    v3 = SimpleEmbedder.get_embedding("unrelated computer architecture network protocol")

    assert len(v1) == 384
    assert v1 == v2  # Deterministic
    assert v1 != v3  # Distinct vector

def test_qdrant_vector_store():
    # Use isolated in-memory qdrant client for test
    test_client = QdrantClient(":memory:")
    store = QdrantVectorStore(client=test_client)

    chunk = DocumentChunk(
        chunk_id="test_c1",
        document_id=999,
        filename="test.txt",
        content="Virtual memory extends physical RAM capacity using secondary storage paging.",
        page_number=1,
        section="Memory",
        topic="Memory Management"
    )

    store.add_chunks([chunk])

    results = store.search_similar("virtual memory paging", document_id=999, top_k=2)
    assert len(results) >= 1
    assert results[0]["document_id"] == 999
    assert "Virtual memory" in results[0]["content"]

    # Cleanup
    store.delete_document_chunks(999)
