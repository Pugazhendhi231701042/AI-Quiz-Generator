def chunk_documents(documents, chunk_size=800, overlap=100):
    """
    Split extracted documents into smaller overlapping chunks.

    Each chunk keeps its source and page metadata.
    """

    chunks = []

    for document in documents:
        text = document["text"]
        source = document["source"]
        page = document["page"]

        start = 0

        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append({
                    "text": chunk_text,
                    "source": source,
                    "page": page,
                    "chunk_id": len(chunks)
                })

            if end >= len(text):
                break

            start = end - overlap

    return chunks