import React from 'react';
import { TopicPerformance } from '../../types';

interface TopicMasteryChartProps {
  topics: TopicPerformance[];
}

export const TopicMasteryChart: React.FC<TopicMasteryChartProps> = ({ topics }) => {
  if (topics.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center border border-slate-800">
        <p className="text-xs text-slate-500">No topic performance data available yet.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Strong':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Strong</span>;
      case 'Weak':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Weak</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Average</span>;
    }
  };

  const getBarColor = (acc: number) => {
    if (acc >= 75) return 'bg-emerald-500';
    if (acc >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {topics.map((t, idx) => (
        <div key={idx} className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-200">{t.topic}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{t.accuracy_percentage}%</span>
              {getStatusBadge(t.status)}
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(t.accuracy_percentage)}`}
              style={{ width: `${t.accuracy_percentage}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>{t.correct_count} of {t.total_answered} correct</span>
            <span>{t.total_answered} attempts</span>
          </div>
        </div>
      ))}
    </div>
  );
};
