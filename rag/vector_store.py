import faiss
import numpy as np


class VectorStore:
    def __init__(self, dimension):
        self.index = faiss.IndexFlatIP(dimension)
        self.metadata = []

    def add_embeddings(self, embeddings, chunks):
        vectors = np.asarray(embeddings, dtype="float32")

        self.index.add(vectors)
        self.metadata.extend(chunks)

    def search(self, query_embedding, top_k=5):
        query_vector = np.asarray(
            [query_embedding],
            dtype="float32"
        )

        scores, indices = self.index.search(query_vector, top_k)

        results = []

        for score, index in zip(scores[0], indices[0]):
            if index == -1:
                continue

            result = self.metadata[index].copy()
            result["score"] = float(score)

            results.append(result)

        return results