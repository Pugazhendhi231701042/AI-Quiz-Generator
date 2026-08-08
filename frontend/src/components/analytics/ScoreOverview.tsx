import React from 'react';
import { AnalyticsSummary } from '../../types';
import { Award, Target, HelpCircle } from 'lucide-react';

interface ScoreOverviewProps {
  summary: AnalyticsSummary;
}

export const ScoreOverview: React.FC<ScoreOverviewProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Total Quizzes</p>
          <h3 className="text-2xl font-bold text-slate-100">{summary.total_quizzes_taken}</h3>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Average Accuracy</p>
          <h3 className="text-2xl font-bold text-slate-100">{summary.average_score}%</h3>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Questions Answered</p>
          <h3 className="text-2xl font-bold text-slate-100">{summary.total_questions_answered}</h3>
        </div>
      </div>
    </div>
  );
};
