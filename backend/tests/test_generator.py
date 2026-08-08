import pytest
from app.services.validator.quality_validator import QuestionValidator

def test_question_validator_success():
    q = {
        "type": "mcq",
        "question": "What is the primary role of context switching in CPU scheduling?",
        "options": [
            "Saving state of running process and loading state of next process",
            "Allocating disk space for swap files",
            "Compiling source code to binary",
            "Formatting physical RAM sectors"
        ],
        "correct_answer": "Saving state of running process and loading state of next process",
        "explanation": "Context switching allows the OS CPU scheduler to swap process execution state.",
        "difficulty": "medium",
        "topic": "Process Management"
    }

    chunks = [{"content": "Context switching saves state of running process and loads next process state."}]
    is_valid, reason = QuestionValidator.validate_question(q, chunks, [])
    assert is_valid is True
    assert reason == "Passed validation."

def test_question_validator_duplicate():
    q1 = {"type": "mcq", "question": "What is virtual memory?", "options": ["A", "B", "C", "D"], "correct_answer": "A"}
    q2 = {"type": "mcq", "question": "What is virtual memory?", "options": ["A", "B", "C", "D"], "correct_answer": "A"}

    is_valid, reason = QuestionValidator.validate_question(q2, [], [q1])
    assert is_valid is False
    assert "Duplicate question" in reason
