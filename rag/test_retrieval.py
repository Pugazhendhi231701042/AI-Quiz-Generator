from extractor import extract_document
from chunker import chunk_documents
from embedder import generate_embeddings, model
from vector_store import VectorStore


# 1. Load document
file_path = "data/ComputerNetworks.docx"

documents = extract_document(file_path)

# 2. Create chunks
chunks = chunk_documents(documents)

# 3. Create embeddings for chunks
embeddings = generate_embeddings(chunks)

# 4. Create FAISS vector store
dimension = embeddings.shape[1]

vector_store = VectorStore(dimension)

# 5. Store embeddings + metadata
vector_store.add_embeddings(embeddings, chunks)

# 6. User's topic/query
query = "TCP congestion control"

# 7. Convert query into an embedding
query_embedding = model.encode(
    query,
    normalize_embeddings=True
)

# 8. Retrieve top 5 relevant chunks
results = vector_store.search(
    query_embedding,
    top_k=5
)

# 9. Display results
print("\nTOP RETRIEVED CHUNKS")
print("=" * 60)

for result in results:
    print("\nChunk ID:", result["chunk_id"])
    print("Source:", result["source"])
    print("Page:", result["page"])
    print("Similarity Score:", result["score"])
    print("Text:", result["text"][:500])