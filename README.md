# AI Quiz Generator & Learning Platform 🚀

A production-ready **AI-powered Quiz Generator & Learning Assistant** that converts study materials (PDF, DOCX, PPTX, TXT, Markdown) into grounded quizzes, practice questions, interactive 3D flashcards, source citations, and topic mastery analytics.

---

## 🌟 Key Features

- **Multi-Format Document Extraction**: Extracts and structures content from PDF, DOCX, PPTX, TXT, and Markdown documents while preserving page numbers and section headers.
- **Structure-Aware Chunker**: Chunks text into 500–800 token windows with 50–100 token overlap.
- **Qdrant Vector Database**: Stores chunk embeddings for RAG retrieval with support for topic metadata filtering.
- **Gemini LLM Integration**: Implemented via abstract `LLMProvider` interface using Google Gemini (`gemini-2.5-flash`) for structured output generation.
- **RAG Source Traceability**: Every question & explanation links directly to its source document name, page number, section header, and retrieved chunk text.
- **Question Quality Validation Loop**: Automatic validation pipeline checking grounding, relevance, correctness, distractor quality, and duplicate detection with up to 3 retries.
- **Primary Question Formats**:
  - Multiple Choice Questions (MCQs - 4 options with distractor verification)
  - True / False Questions
  - Fill in the Blank
- **Interactive Quiz Modes**: Practice Mode (instant educational explanation & source citation), Exam Mode (submit at end), and Timed Mode.
- **Interactive 3D Flashcard Deck**: Flip cards (Definition, Concept, Process), study counters, and mastery controls.
- **Performance Analytics & Adaptive Practice**: Per-topic accuracy tracking, weak topic diagnostic reports, and 1-click personalized practice quiz recommendations.

---

## 📁 System Architecture

```text
ai-quiz-generator/
├── backend/
│   ├── app/
│   │   ├── api/                    # REST endpoints (auth, docs, quizzes, flashcards, analytics)
│   │   ├── core/                   # Config, DB connection, JWT auth, exceptions
│   │   ├── models/                 # SQLAlchemy ORM schemas
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── document/           # Text extractor (PDF, DOCX, PPTX, TXT, MD)
│   │   │   ├── rag/                # Structure-aware chunker, Qdrant vector store
│   │   │   ├── llm/                # LLMProvider + Gemini implementation
│   │   │   ├── generator/          # Topic analyzer, Quiz & Flashcard engines
│   │   │   └── validator/          # Question quality & grounding validator
│   │   └── main.py                 # FastAPI application
│   ├── tests/                      # Pytest backend test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI elements (Navbar, Sidebar, FileUploader, QuestionViewer, FlipCardDeck)
│   │   ├── pages/                  # Route views (Dashboard, Documents, GenerateQuiz, TakeQuiz, QuizResult, Flashcards, Performance)
│   │   ├── context/                # AuthContext
│   │   ├── services/               # Axios API client
│   │   └── types/                  # TypeScript interfaces
│   └── package.json
└── README.md
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional) Gemini API Key (`GEMINI_API_KEY`)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Add your Gemini API key in `backend/.env`:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```
FastAPI Swagger Documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🧪 Running Automated Tests

Run backend unit and integration tests with Pytest:
```bash
cd backend
pytest -v
```

---

## 🔒 Security & Data Privacy
- **JWT Authentication**: User credentials and uploaded documents are isolated per user account.
- **Secure File Storage**: File validation for allowed extensions (`.pdf`, `.docx`, `.pptx`, `.txt`, `.md`) with maximum size enforcement (25MB).
- **Environment Isolation**: API keys and secrets stored securely in environment variables.

---

## 🔮 Future Enhancements
- OCR engine integration for scanned/image-only PDFs.
- Additional question types (Short Answer with AI semantic evaluation, Matching pairs).
- Export quizzes to PDF / Anki flashcard deck formats.
