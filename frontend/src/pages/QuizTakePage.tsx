import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../services/api';
import { Quiz, Question } from '../types';
import { QuestionViewer } from '../components/quiz/QuestionViewer';
import { SourceModal } from '../components/quiz/SourceModal';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export const QuizTakePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedSourceQuestion, setSelectedSourceQuestion] = useState<Question | undefined>(undefined);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return;
      try {
        const data = await quizApi.get(parseInt(id));
        setQuiz(data);
      } catch (err) {
        console.error("Failed to load quiz:", err);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-300">Loading Quiz & Questions...</p>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);

    const answerPayload = quiz.questions.map((q) => ({
      question_id: q.id,
      user_answer: userAnswers[q.id] || '',
      time_taken_seconds: 10
    }));

    try {
      const attempt = await quizApi.submit(quiz.id, answerPayload, elapsedSeconds);
      navigate(`/quiz-result/${attempt.attempt_id}`, { state: { attempt } });
    } catch (err) {
      alert("Failed to submit quiz attempt.");
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Bar Info */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">{quiz.title}</h2>
          <p className="text-xs text-slate-400">
            Mode: <span className="capitalize text-indigo-400 font-semibold">{quiz.mode}</span> • Difficulty: <span className="capitalize text-indigo-400 font-semibold">{quiz.difficulty}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="text-slate-400">
            {answeredCount} of {quiz.questions.length} Answered
          </div>
        </div>
      </div>

      {/* Main Question Viewer */}
      <QuestionViewer
        question={currentQ}
        currentIndex={currentIndex}
        totalQuestions={quiz.questions.length}
        userAnswer={userAnswers[currentQ.id] || ''}
        onAnswerSelect={handleAnswerSelect}
        isPracticeMode={quiz.mode === 'practice'}
        onOpenSourceModal={(q) => setSelectedSourceQuestion(q)}
      />

      {/* Question Navigation Dots */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {quiz.questions.map((q, idx) => {
          const isAnswered = !!userAnswers[q.id];
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : isAnswered
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {currentIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="glow-button px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(quiz.questions!.length - 1, prev + 1))}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-2"
          >
            Next Question
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Source Reference Modal */}
      <SourceModal
        isOpen={!!selectedSourceQuestion}
        onClose={() => setSelectedSourceQuestion(undefined)}
        source={selectedSourceQuestion?.source_reference}
      />
    </div>
  );
};
