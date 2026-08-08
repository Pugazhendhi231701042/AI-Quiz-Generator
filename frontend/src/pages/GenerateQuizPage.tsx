import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { documentApi, quizApi } from '../services/api';
import { Document } from '../types';
import { Sparkles, CheckSquare, Loader2, BookOpen, Layers } from 'lucide-react';

export const GenerateQuizPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedDocId = searchParams.get('doc');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(
    preselectedDocId ? parseInt(preselectedDocId) : null
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('mixed');
  const [mode, setMode] = useState<string>('practice');
  const [questionTypes, setQuestionTypes] = useState<string[]>(['mcq', 'true_false', 'fill_in_blank']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const data = await documentApi.list();
        const completed = data.filter((d) => d.status === 'completed');
        setDocuments(completed);
        if (!selectedDocId && completed.length > 0) {
          setSelectedDocId(completed[0].id);
        }
      } catch (err) {
        console.error("Failed to load documents:", err);
      }
    };
    loadDocs();
  }, []);

  const selectedDocument = documents.find((d) => d.id === selectedDocId);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const toggleType = (typeStr: string) => {
    setQuestionTypes((prev) => {
      if (prev.includes(typeStr)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== typeStr);
      }
      return [...prev, typeStr];
    });
  };

  const handleGenerate = async () => {
    if (!selectedDocId) {
      setError("Please select a study document.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const quiz = await quizApi.generate({
        document_id: selectedDocId,
        question_count: questionCount,
        difficulty,
        question_types: questionTypes,
        selected_topics: selectedTopics,
        mode,
        time_limit_minutes: 15
      });
      navigate(`/quiz/${quiz.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          RAG AI Assessment Studio
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Configure Your Custom AI Quiz
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Select your study material, topics, difficulty, and question formats.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6 shadow-2xl">
        {/* Step 1: Select Document */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            1. Select Study Document
          </label>

          {documents.length === 0 ? (
            <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              No completed documents found. Please upload a study document first.
            </p>
          ) : (
            <select
              value={selectedDocId || ''}
              onChange={(e) => {
                setSelectedDocId(Number(e.target.value));
                setSelectedTopics([]);
              }}
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename} ({doc.chunk_count} RAG Chunks)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Step 2: Topic Filter */}
        {selectedDocument && selectedDocument.detected_topics.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              2. Filter By Detected Topics (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedDocument.detected_topics.map((topic, i) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Question Formats */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            3. Question Formats
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'mcq', label: 'Multiple Choice' },
              { id: 'true_false', label: 'True / False' },
              { id: 'fill_in_blank', label: 'Fill in Blank' }
            ].map((item) => {
              const isChecked = questionTypes.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleType(item.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    isChecked
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Difficulty & Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Difficulty</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['easy', 'medium', 'hard', 'mixed'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    difficulty === diff
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quiz Mode</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'practice', label: 'Practice' },
                { id: 'exam', label: 'Exam' },
                { id: 'timed', label: 'Timed' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    mode === m.id
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 5: Question Count Slider (increment by 1, min 1, default 5) */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Number of Questions</span>
            <span className="text-indigo-400 font-extrabold">{questionCount} {questionCount === 1 ? 'Question' : 'Questions'}</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-0.5">
            <span>1</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Generate Trigger */}
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedDocId}
          className="w-full py-4 rounded-xl glow-button font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Retrieving Chunks & Validating Grounded Questions...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate RAG Quiz Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};
