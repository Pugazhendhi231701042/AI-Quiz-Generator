from extractor import extract_document
from chunker import chunk_documents
from embedder import generate_embeddings


file_path = "data/ComputerNetworks.docx"

documents = extract_document(file_path)

chunks = chunk_documents(documents)

embeddings = generate_embeddings(chunks)

print("Number of chunks:", len(chunks))
print("Number of embeddings:", len(embeddings))
print("Embedding dimension:", len(embeddings[0]))