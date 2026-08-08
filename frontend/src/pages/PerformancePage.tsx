import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../services/api';
import { AnalyticsSummary } from '../types';
import { ScoreOverview } from '../components/analytics/ScoreOverview';
import { TopicMasteryChart } from '../components/analytics/TopicMasteryChart';
import { BarChart3, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PerformancePage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsApi.getSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Performance & Topic Mastery Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed breakdown of your strengths, weak areas, accuracy trends, and adaptive practice recommendations.
        </p>
      </div>

      {summary && <ScoreOverview summary={summary} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Topic Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-200">Topic Mastery Breakdown</h2>
          {summary && <TopicMasteryChart topics={summary.topic_breakdown} />}
        </div>

        {/* Diagnostic Summary & Recommendations */}
        <div className="space-y-6">
          {/* Strong Topics */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Strong Topics (≥75%)
            </h3>
            {summary?.strong_topics && summary.strong_topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.strong_topics.map((t, i) => (
                  <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No strong topics recorded yet.</p>
            )}
          </div>

          {/* Weak Topics & Practice Recommendations */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              Weak Topics & Practice Plan
            </h3>

            {summary?.recommendations && summary.recommendations.length > 0 ? (
              <div className="space-y-3">
                {summary.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-900 border border-red-500/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{rec.topic}</span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                        {rec.suggested_difficulty}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">{rec.reason}</p>
                    <Link
                      to={`/generate-quiz`}
                      className="inline-flex items-center gap-1.5 font-bold text-indigo-400 hover:text-indigo-300 pt-1"
                    >
                      <span>Practice {rec.topic}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Keep completing quizzes to generate practice recommendations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
