from extractor import extract_document
from chunker import chunk_documents


file_path = "data/ComputerNetworks.docx"

# Step 1: Extract
documents = extract_document(file_path)

# Step 2: Chunk
chunks = chunk_documents(documents)

print("Total chunks:", len(chunks))

for chunk in chunks[:5]:
    print("\n" + "=" * 60)
    print("Chunk ID:", chunk["chunk_id"])
    print("Source:", chunk["source"])
    print("Page:", chunk["page"])
    print("Text:")
    print(chunk["text"])