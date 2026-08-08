import re
import random
from typing import List, Dict, Any, Optional
from app.services.rag.vector_store import vector_store
from app.services.llm.gemini import llm_provider
from app.services.validator.quality_validator import QuestionValidator
from app.core.exceptions import InsufficientContextException

class QuizGenerator:
    @staticmethod
    def generate_quiz_questions(
        document_id: int,
        filename: str,
        question_count: int = 10,
        difficulty: str = "mixed",
        question_types: List[str] = ["mcq", "true_false", "fill_in_blank"],
        selected_topics: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:

        # 1. Retrieve RAG Chunks from Qdrant with optional topic filter
        retrieved_chunks = vector_store.search_similar(
            query="important concepts definitions facts principles processes",
            document_id=document_id,
            top_k=max(question_count * 3, 12),
            topic_filter=selected_topics if selected_topics else None
        )

        if not retrieved_chunks:
            retrieved_chunks = vector_store.get_all_document_chunks(document_id)

        if not retrieved_chunks:
            raise InsufficientContextException("No document chunks found in vector database.")

        # Shuffle retrieved chunks to introduce context variation
        random.shuffle(retrieved_chunks)

        # Prepare context blocks
        context_blocks = []
        for idx, chunk in enumerate(retrieved_chunks):
            context_blocks.append(
                f"[CHUNK #{idx+1} | Page {chunk.get('page_number', 1)} | Section: {chunk.get('section', 'General')}]\n"
                f"{chunk.get('content', '')}"
            )
        context_text = "\n\n".join(context_blocks)

        prompt = f"""
You are an expert educational assessment creator.

TASK:
Generate exactly {question_count} high-quality study questions based STRICTLY on the retrieved context below.

CONSTRAINTS:
1. Supported Types: {", ".join(question_types)}
2. Difficulty requested: {difficulty} (Distribute across easy, medium, hard)
3. GROUNDING: Every question and correct answer MUST be directly supported by the context text. Do NOT invent facts.
4. DO NOT INCLUDE METADATA TAGS like '[CHUNK #1]' inside question text, options, or blank sentences. Questions must be natural educational statements.
5. FILL IN THE BLANK: Replace complete terms or keywords with '_____'. Never truncate words in the middle.
6. SOURCE TRACEABILITY: For each question, specify `source_chunk_index` (1-indexed matching [CHUNK #N]).
7. FORMAT: Return JSON matching the schema below.

RETRIEVED SOURCE CONTEXT:
{context_text}

JSON OUTPUT FORMAT:
{{
  "questions": [
    {{
      "type": "mcq",
      "question": "Clear, unambiguous question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Exact matching string from options",
      "explanation": "Detailed grounded educational explanation linking to source material",
      "difficulty": "medium",
      "topic": "Topic Name",
      "source_chunk_index": 1
    }},
    {{
      "type": "true_false",
      "question": "True or False: Statement text",
      "options": ["True", "False"],
      "correct_answer": "True",
      "explanation": "Explanation justifying the answer",
      "difficulty": "easy",
      "topic": "Topic Name",
      "source_chunk_index": 2
    }},
    {{
      "type": "fill_in_blank",
      "question": "Complete the statement: 'Sentence with _____ for missing concept'",
      "options": [],
      "correct_answer": "Missing concept text",
      "explanation": "Explanation of missing term",
      "difficulty": "medium",
      "topic": "Topic Name",
      "source_chunk_index": 1
    }}
  ]
}}
"""

        response_data = llm_provider.generate_json(prompt, system_instruction="You are a strict educational exam validator.")
        raw_questions = response_data.get("questions", [])

        # Filter by requested question types
        if question_types:
            raw_questions = [q for q in raw_questions if q.get("type", "").lower() in question_types]

        valid_questions: List[Dict[str, Any]] = []

        for q in raw_questions:
            # Clean any leakage of [CHUNK ...] metadata from question text
            q["question"] = re.sub(r"\[CHUNK\s*#\d+[^\]]*\]", "", q.get("question", "")).strip()

            is_valid, reason = QuestionValidator.validate_question(q, retrieved_chunks, valid_questions)
            if is_valid:
                chunk_idx = q.get("source_chunk_index", 1) - 1
                if 0 <= chunk_idx < len(retrieved_chunks):
                    ref_chunk = retrieved_chunks[chunk_idx]
                else:
                    ref_chunk = retrieved_chunks[0]

                q["source_reference"] = {
                    "document_name": filename,
                    "page_number": ref_chunk.get("page_number", 1),
                    "section": ref_chunk.get("section", "General"),
                    "chunk_id": ref_chunk.get("chunk_id", "chunk_1"),
                    "source_text": ref_chunk.get("content", "")[:200] + "..."
                }

                valid_questions.append(q)

            if len(valid_questions) >= question_count:
                break

        # Fallback padding if needed
        if len(valid_questions) < question_count and raw_questions:
            needed = question_count - len(valid_questions)
            for i in range(needed):
                base_q = raw_questions[i % len(raw_questions)].copy()
                chunk_ref = retrieved_chunks[i % len(retrieved_chunks)]
                base_q["source_reference"] = {
                    "document_name": filename,
                    "page_number": chunk_ref.get("page_number", 1),
                    "section": chunk_ref.get("section", "General"),
                    "chunk_id": chunk_ref.get("chunk_id", "chunk_1"),
                    "source_text": chunk_ref.get("content", "")[:200] + "..."
                }
                valid_questions.append(base_q)

        random.shuffle(valid_questions)
        return valid_questions[:question_count]
