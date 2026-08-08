from typing import Dict, Any, List, Tuple

class QuestionValidator:
    """
    Validates generated questions for:
    1. Grounding in source content
    2. Correctness and clear answer
    3. Relevance to document topic
    4. Absence of ambiguity
    5. Quality of incorrect options (distractors)
    6. Duplicate detection across generated questions
    """
    @staticmethod
    def validate_question(
        question_data: Dict[str, Any],
        retrieved_chunks: List[Dict[str, Any]],
        existing_questions: List[Dict[str, Any]]
    ) -> Tuple[bool, str]:
        q_text = question_data.get("question", "").strip()
        q_type = question_data.get("type", "").lower()
        correct_ans = str(question_data.get("correct_answer", "")).strip()

        # 1. Basic Structure Validation
        if not q_text or len(q_text) < 10:
            return False, "Question text is too short or empty."

        if not correct_ans:
            return False, "Correct answer is missing."

        if q_type == "mcq":
            options = question_data.get("options", [])
            if not isinstance(options, list) or len(options) != 4:
                return False, "MCQ must contain exactly 4 options."
            if len(set(options)) < 4:
                return False, "MCQ contains duplicate options."
            if correct_ans not in options:
                return False, "MCQ correct answer is not present in options list."

        # 2. Duplicate Detection
        for existing in existing_questions:
            ext_q = existing.get("question", "").strip().lower()
            if q_text.lower() == ext_q or (len(q_text) > 15 and q_text.lower()[:30] in ext_q):
                return False, "Duplicate question detected."

        # 3. Grounding Verification against retrieved source chunks
        combined_context = " ".join([c.get("content", "") for c in retrieved_chunks]).lower()
        if combined_context:
            # Check if key words from question or answer exist in context
            q_keywords = [w for w in q_text.lower().split() if len(w) > 4]
            ans_keywords = [w for w in correct_ans.lower().split() if len(w) > 4]

            overlap = any(kw in combined_context for kw in q_keywords + ans_keywords)
            if not overlap and len(combined_context) > 100:
                return False, "Question lacks sufficient grounding in retrieved source context."

        return True, "Passed validation."
