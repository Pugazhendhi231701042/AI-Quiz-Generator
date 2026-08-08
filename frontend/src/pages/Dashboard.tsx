import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentApi, quizApi, analyticsApi } from '../services/api';
import { Document, Quiz, AnalyticsSummary } from '../types';
import { FileUploader } from '../components/document/FileUploader';
import { ScoreOverview } from '../components/analytics/ScoreOverview';
import { Sparkles, FileText, HelpCircle, Layers, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsData, quizData, analyticsData] = await Promise.all([
        documentApi.list(),
        quizApi.list(),
        analyticsApi.getSummary()
      ]);
      setDocuments(docsData);
      setQuizzes(quizData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Assessment & Grounded Flashcard Generator
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Upload study documents to instantly build grounded quizzes, interactive flashcards, and track your topic mastery.
          </p>
        </div>
        <div className="flex gap-3 shrink-0 z-10">
          <Link
            to="/generate-quiz"
            className="glow-button px-5 py-3 rounded-xl text-xs font-bold text-white flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Quick Quiz Generator
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      {analytics && <ScoreOverview summary={analytics} />}

      {/* Main Grid: Upload & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Upload Study Document
            </h2>
            <Link to="/documents" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View All ({documents.length})
            </Link>
          </div>

          <FileUploader onUploadSuccess={() => fetchData()} />

          {/* Recent Documents Table/List */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Recent Documents</h3>
            {documents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold uppercase">
                        {doc.file_type}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{doc.filename}</p>
                        <p className="text-[11px] text-slate-400">{doc.chunk_count} RAG chunks</p>
                      </div>
                    </div>
                    <Link
                      to={`/generate-quiz?doc=${doc.id}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold border border-indigo-500/30"
                    >
                      Quiz
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Cards: Recommendations & Weak Topics */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Practice Recommendations
            </h3>

            {analytics?.recommendations && analytics.recommendations.length > 0 ? (
              <div className="space-y-3">
                {analytics.recommendations.slice(0, 2).map((rec, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-amber-300">
                      <span>{rec.topic}</span>
                      <span className="uppercase text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">
                        {rec.suggested_difficulty}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{rec.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Take a quiz to generate personalized recommendations.</p>
            )}
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">Recent Quizzes</h3>
              <Link to="/generate-quiz" className="text-xs font-semibold text-indigo-400">View All</Link>
            </div>
            {quizzes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No quizzes generated yet.</p>
            ) : (
              <div className="space-y-2">
                {quizzes.slice(0, 3).map((q) => (
                  <Link
                    key={q.id}
                    to={`/quiz/${q.id}`}
                    className="block p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-200 truncate">{q.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{q.question_count} questions</span>
                      <span className="capitalize text-indigo-400 font-semibold">{q.mode}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
