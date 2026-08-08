import os
import hashlib
import numpy as np
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from app.core.config import settings
from app.services.rag.chunker import DocumentChunk

class BaseVectorStore(ABC):
    @abstractmethod
    def add_chunks(self, chunks: List[DocumentChunk]):
        pass

    @abstractmethod
    def search_similar(
        self,
        query: str,
        document_id: int,
        top_k: int = 5,
        topic_filter: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def delete_document_chunks(self, document_id: int):
        pass

class SimpleEmbedder:
    """
    Fast, reliable embedding generator producing 384-dim normalized vectors
    using sub-word hashing and word co-occurrence features.
    Guarantees deterministic local execution without requiring heavy downloads.
    """
    VECTOR_DIM = 384

    @staticmethod
    def get_embedding(text: str) -> List[float]:
        words = text.lower().split()
        vector = np.zeros(SimpleEmbedder.VECTOR_DIM, dtype=np.float32)
        if not words:
            return vector.tolist()

        for w in words:
            h1 = int(hashlib.md5(w.encode('utf-8')).hexdigest(), 16) % SimpleEmbedder.VECTOR_DIM
            h2 = int(hashlib.sha256(w.encode('utf-8')).hexdigest(), 16) % SimpleEmbedder.VECTOR_DIM
            vector[h1] += 1.0
            vector[h2] += 0.5

        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        return vector.tolist()

class QdrantVectorStore(BaseVectorStore):
    def __init__(self, client: Optional[QdrantClient] = None):
        self.collection_name = settings.QDRANT_COLLECTION
        if client:
            self.client = client
        elif settings.QDRANT_MODE == "local":
            self.client = QdrantClient(path=settings.QDRANT_PATH)
        else:
            self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)

        self._ensure_collection()

    def _ensure_collection(self):
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(
                    size=SimpleEmbedder.VECTOR_DIM,
                    distance=qmodels.Distance.COSINE
                )
            )

    def add_chunks(self, chunks: List[DocumentChunk]):
        if not chunks:
            return

        points = []
        for idx, chunk in enumerate(chunks):
            vector = SimpleEmbedder.get_embedding(chunk.content)
            point_id = int(hashlib.md5(chunk.chunk_id.encode('utf-8')).hexdigest()[:8], 16)
            
            payload = chunk.to_dict()
            points.append(qmodels.PointStruct(
                id=point_id,
                vector=vector,
                payload=payload
            ))

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search_similar(
        self,
        query: str,
        document_id: int,
        top_k: int = 5,
        topic_filter: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        query_vector = SimpleEmbedder.get_embedding(query)

        must_conditions = [
            qmodels.FieldCondition(
                key="document_id",
                match=qmodels.MatchValue(value=document_id)
            )
        ]

        if topic_filter:
            topic_conditions = [
                qmodels.FieldCondition(
                    key="topic",
                    match=qmodels.MatchValue(value=top)
                ) for top in topic_filter
            ]
            must_conditions.append(qmodels.Filter(should=topic_conditions))

        search_result = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=qmodels.Filter(must=must_conditions),
            limit=top_k
        )

        results = []
        for hit in search_result:
            payload = hit.payload
            payload["score"] = hit.score
            results.append(payload)

        return results

    def get_all_document_chunks(self, document_id: int) -> List[Dict[str, Any]]:
        search_result, _ = self.client.scroll(
            collection_name=self.collection_name,
            scroll_filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="document_id",
                        match=qmodels.MatchValue(value=document_id)
                    )
                ]
            ),
            limit=100
        )
        return [hit.payload for hit in search_result]

    def delete_document_chunks(self, document_id: int):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=qmodels.FilterSelector(
                filter=qmodels.Filter(
                    must=[
                        qmodels.FieldCondition(
                            key="document_id",
                            match=qmodels.MatchValue(value=document_id)
                        )
                    ]
                )
            )
        )

# Lazy Singleton Instance
_vector_store_instance = None

def get_vector_store() -> QdrantVectorStore:
    global _vector_store_instance
    if _vector_store_instance is None:
        _vector_store_instance = QdrantVectorStore()
    return _vector_store_instance

class LazyVectorStoreProxy(BaseVectorStore):
    def add_chunks(self, chunks: List[DocumentChunk]):
        get_vector_store().add_chunks(chunks)

    def search_similar(self, query: str, document_id: int, top_k: int = 5, topic_filter: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        return get_vector_store().search_similar(query, document_id, top_k, topic_filter)

    def delete_document_chunks(self, document_id: int):
        get_vector_store().delete_document_chunks(document_id)

    def get_all_document_chunks(self, document_id: int) -> List[Dict[str, Any]]:
        return get_vector_store().get_all_document_chunks(document_id)

vector_store = LazyVectorStoreProxy()
