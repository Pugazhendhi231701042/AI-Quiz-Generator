import React, { useEffect, useState } from 'react';
import { documentApi } from '../services/api';
import { Document } from '../types';
import { FileUploader } from '../components/document/FileUploader';
import { DocumentList } from '../components/document/DocumentList';
import { FileText, RefreshCw } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await documentApi.list();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this document and its RAG vectors?")) {
      try {
        await documentApi.delete(id);
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        alert("Failed to delete document.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Study Document Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload PDF, DOCX, PPTX, TXT, or Markdown documents to build your vector knowledge base.
          </p>
        </div>
        <button
          onClick={fetchDocs}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Upload Zone */}
      <FileUploader onUploadSuccess={() => fetchDocs()} />

      {/* Uploaded Documents List */}
      <div>
        <h3 className="text-base font-bold text-slate-200 mb-4">
          Your Uploaded Documents ({documents.length})
        </h3>
        <DocumentList documents={documents} onDelete={handleDelete} />
      </div>
    </div>
  );
};
