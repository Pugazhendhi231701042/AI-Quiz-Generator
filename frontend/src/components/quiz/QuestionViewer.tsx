import React, { useState } from 'react';
import { Question } from '../../types';
import { HelpCircle, CheckCircle2, XCircle, Info, BookOpen } from 'lucide-react';

interface QuestionViewerProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswer: string;
  onAnswerSelect: (answer: string) => void;
  isPracticeMode?: boolean;
  onOpenSourceModal: (q: Question) => void;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
  question,
  currentIndex,
  totalQuestions,
  userAnswer,
  onAnswerSelect,
  isPracticeMode = true,
  onOpenSourceModal,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionClick = (option: string) => {
    onAnswerSelect(option);
    if (isPracticeMode) {
      setShowExplanation(true);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Easy</span>;
      case 'hard':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Hard</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-800 space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          {getDifficultyBadge(question.difficulty)}
          <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2.5 py-1 rounded-lg">
            {question.topic}
          </span>
        </div>

        <button
          onClick={() => onOpenSourceModal(question)}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          View Source Citation
        </button>
      </div>

      {/* Question Prompt */}
      <div>
        <h3 className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Render Question Inputs based on Type */}
      {question.type === 'mcq' && (
        <div className="grid grid-cols-1 gap-3">
          {question.options?.map((opt, idx) => {
            const isSelected = userAnswer === opt;
            const isCorrect = opt === question.correct_answer;
            let btnStyle = "border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-200";

            if (userAnswer) {
              if (isPracticeMode) {
                if (isCorrect) {
                  btnStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold";
                } else if (isSelected) {
                  btnStyle = "border-red-500/50 bg-red-500/10 text-red-300";
                }
              } else if (isSelected) {
                btnStyle = "border-indigo-500 bg-indigo-500/20 text-indigo-300 font-semibold";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${btnStyle}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'true_false' && (
        <div className="grid grid-cols-2 gap-4">
          {['True', 'False'].map((tfOption) => {
            const isSelected = userAnswer === tfOption;
            return (
              <button
                key={tfOption}
                onClick={() => handleOptionClick(tfOption)}
                className={`py-6 px-4 rounded-xl border font-bold text-center text-base transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 shadow-lg shadow-indigo-500/20'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {tfOption}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'fill_in_blank' && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Answer
          </label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => onAnswerSelect(e.target.value)}
            placeholder="Type the missing concept here..."
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      )}

      {/* Practice Mode Instant Educational Explanation */}
      {isPracticeMode && userAnswer && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Info className="w-4 h-4" />
            <span>AI Educational Explanation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
