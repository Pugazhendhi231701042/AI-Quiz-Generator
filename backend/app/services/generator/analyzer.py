from typing import List, Dict, Any
from app.services.llm.gemini import llm_provider

class DocumentAnalyzer:
    @staticmethod
    def analyze_document(chunks_content: List[str]) -> List[str]:
        if not chunks_content:
            return ["General Study Material"]

        sample_text = "\n---\n".join(chunks_content[:5])
        analysis = llm_provider.analyze_content(sample_text)

        topics = analysis.get("topics", [])
        if not topics or not isinstance(topics, list):
            # Fallback heuristic topic extraction if empty
            topics = ["Core Concepts", "Definitions & Terms", "Key Principles"]

        # Clean and deduplicate topics
        clean_topics = list(dict.fromkeys([str(t).strip() for t in topics if str(t).strip()]))
        return clean_topics[:6]
