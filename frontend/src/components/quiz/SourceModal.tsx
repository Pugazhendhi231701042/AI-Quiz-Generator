import React from 'react';
import { Modal } from '../common/Modal';
import { SourceReference } from '../../types';
import { FileText, Bookmark, Hash } from 'lucide-react';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: SourceReference;
}

export const SourceModal: React.FC<SourceModalProps> = ({ isOpen, onClose, source }) => {
  if (!source) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="RAG Source Traceability Citation">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-slate-500 font-medium">Document</p>
              <p className="font-bold text-slate-200 truncate">{source.document_name}</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-slate-500 font-medium">Page & Section</p>
              <p className="font-bold text-slate-200">
                Page {source.page_number || 1} • {source.section || 'General'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Hash className="w-3.5 h-3.5 text-indigo-400" />
            <span>Retrieved Chunk ID: {source.chunk_id}</span>
          </div>
          <blockquote className="text-xs text-slate-300 italic border-l-2 border-indigo-500 pl-3 py-1 leading-relaxed">
            "{source.source_text || 'Source text excerpt retrieved from vector store.'}"
          </blockquote>
        </div>

        <div className="text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
};
