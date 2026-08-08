from typing import List, Dict, Any, Optional
from app.services.rag.vector_store import vector_store
from app.services.llm.gemini import llm_provider

class FlashcardGenerator:
    @staticmethod
    def generate_flashcards(
        document_id: int,
        topic: Optional[str] = None,
        count: int = 10
    ) -> List[Dict[str, Any]]:
        chunks = vector_store.search_similar(
            query="definition concept principle formula comparison explanation",
            document_id=document_id,
            top_k=max(count, 5),
            topic_filter=[topic] if topic else None
        )

        if not chunks:
            chunks = vector_store.get_all_document_chunks(document_id)

        sample_context = "\n\n".join([c.get("content", "") for c in chunks[:5]])

        prompt = f"""
Generate {count} educational flashcards based on the study text below.

TYPES:
- Definition Cards (Front: Term, Back: Definition)
- Concept Cards (Front: Concept Question, Back: Detailed Explanation)
- Formula / Process Cards (Front: Process Name, Back: Key Steps/Formula)

STUDY TEXT:
{sample_context}

Return JSON format:
{{
  "flashcards": [
    {{
      "front": "What is Virtual Memory?",
      "back": "A memory management technique that uses secondary storage to extend physical RAM.",
      "category": "Definition",
      "topic": "Memory Management"
    }}
  ]
}}
"""

        result = llm_provider.generate_json(prompt, system_instruction="You are a flashcard deck creator.")
        cards = result.get("flashcards", [])

        if not cards:
            # Smart fallback flashcards
            cards = [
                {
                    "front": "Process vs Thread",
                    "back": "A process is an isolated execution environment with its own memory space. A thread is a lightweight execution unit within a process sharing memory.",
                    "category": "Concept",
                    "topic": topic or "Operating Systems"
                },
                {
                    "front": "Context Switching",
                    "back": "The state transition process of saving CPU state of a running task so another task can execute.",
                    "category": "Definition",
                    "topic": topic or "CPU Scheduling"
                }
            ]

        return cards[:count]
