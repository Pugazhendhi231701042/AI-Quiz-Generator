import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { QuizAttemptResponse, UserAnswerResult, Question } from '../types';
import { SourceModal } from '../components/quiz/SourceModal';
import { Award, CheckCircle2, XCircle, BookOpen, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

export const QuizResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const attempt: QuizAttemptResponse = location.state?.attempt;

  const [selectedSource, setSelectedSource] = useState<any>(undefined);

  if (!attempt) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-semibold text-slate-400">No quiz result attempt found.</p>
        <Link to="/" className="text-xs text-indigo-400 underline mt-2 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Result */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Quiz Submission Completed
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white">Quiz Performance Summary</h1>
          <p className="text-xs text-slate-400">
            Completed in {Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center font-extrabold text-3xl shadow-xl ${getScoreColor(attempt.score)}`}>
            <span>{attempt.score}%</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Score</span>
          </div>

          <div className="text-left space-y-1">
            <p className="text-sm font-bold text-slate-200">
              {attempt.correct_count} / {attempt.total_questions} Correct
            </p>
            <p className="text-xs text-slate-400">
              Accuracy: <span className="font-semibold text-indigo-400">{attempt.score}%</span>
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/generate-quiz"
            className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Take Another Quiz
          </Link>
          <Link
            to="/performance"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
          >
            View Analytics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Per Topic Breakdown */}
      {attempt.topic_performance && Object.keys(attempt.topic_performance).length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Topic Performance Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(attempt.topic_performance).map(([topic, acc]) => (
              <div key={topic} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">{topic}</span>
                <span className={acc >= 75 ? 'text-emerald-400' : acc >= 60 ? 'text-amber-400' : 'text-red-400'}>
                  {acc}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Detailed Question Review</h3>

        {attempt.results.map((res, idx) => (
          <div
            key={res.question_id}
            className={`glass-card rounded-2xl p-6 border space-y-4 ${
              res.is_correct ? 'border-emerald-500/30' : 'border-red-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {res.is_correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <h4 className="text-sm font-bold text-slate-200 leading-snug">
                  {idx + 1}. {res.question_text}
                </h4>
              </div>

              {res.source_reference && (
                <button
                  onClick={() => setSelectedSource(res.source_reference)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-colors shrink-0"
                >
                  <BookOpen className="w-3 h-3" />
                  Citation
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Your Answer</span>
                <span className={res.is_correct ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  {res.user_answer || '(No answer provided)'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Correct Answer</span>
                <span className="text-emerald-400 font-medium">{res.correct_answer}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-indigo-400 block mb-0.5">Explanation:</span>
              {res.explanation}
            </div>
          </div>
        ))}
      </div>

      <SourceModal
        isOpen={!!selectedSource}
        onClose={() => setSelectedSource(undefined)}
        source={selectedSource}
      />
    </div>
  );
};
