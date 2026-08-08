import React from 'react';
import { Document } from '../../types';
import { FileText, Trash2, CheckCircle2, Clock, AlertTriangle, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: number) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete }) => {
  if (documents.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center border border-slate-800">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-300">No Documents Uploaded Yet</h4>
        <p className="text-xs text-slate-500 mt-1">Upload lecture notes or study material to start generating quizzes!</p>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold uppercase text-xs">
                  {doc.file_type}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200 line-clamp-1" title={doc.filename}>
                    {doc.filename}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>{formatSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{doc.chunk_count} RAG Chunks</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDelete(doc.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete Document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Status pill */}
            <div className="flex items-center justify-between mb-3">
              {doc.status === 'completed' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Qdrant Vectorized
                </span>
              )}
              {doc.status === 'processing' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  Processing Ingestion...
                </span>
              )}
              {doc.status === 'failed' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Processing Failed
                </span>
              )}
            </div>

            {/* Detected Topics Tags */}
            {doc.detected_topics && doc.detected_topics.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Detected Topics
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {doc.detected_topics.slice(0, 4).map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                    >
                      {topic}
                    </span>
                  ))}
                  {doc.detected_topics.length > 4 && (
                    <span className="text-xs text-slate-500 font-medium px-1">
                      +{doc.detected_topics.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
            <Link
              to={`/generate-quiz?doc=${doc.id}`}
              className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                doc.status === 'completed'
                  ? 'glow-button text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Quiz
            </Link>
            <Link
              to={`/flashcards?doc=${doc.id}`}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Flashcards
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};
