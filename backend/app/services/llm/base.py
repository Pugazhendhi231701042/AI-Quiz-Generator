from abc import ABC, abstractmethod
from typing import Dict, Any, List

class LLMProvider(ABC):
    @abstractmethod
    def generate_json(self, prompt: str, system_instruction: str = "") -> Dict[str, Any]:
        """
        Generate structured JSON response from prompt.
        """
        pass

    @abstractmethod
    def analyze_content(self, text: str) -> Dict[str, Any]:
        """
        Analyze document text to extract topics, concepts, and key facts.
        """
        pass
