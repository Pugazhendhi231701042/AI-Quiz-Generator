import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { documentApi } from '../../services/api';
import { Document } from '../../types';

interface FileUploaderProps {
  onUploadSuccess: (doc: Document) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const validExts = ['pdf', 'docx', 'pptx', 'txt', 'md'];
    const invalid = fileArray.filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return !ext || !validExts.includes(ext);
    });

    if (invalid.length > 0) {
      setError(`Some files have unsupported extensions. Supported: PDF, DOCX, PPTX, TXT, MD.`);
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setProgressText(`Uploading & Indexing ${i + 1} of ${fileArray.length}: ${file.name}...`);
      try {
        const doc = await documentApi.upload(file);
        onUploadSuccess(doc);
        successCount++;
      } catch (err: any) {
        console.error(`Upload error for ${file.name}:`, err);
        setError(err.response?.data?.detail || `Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    setProgressText('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-card rounded-2xl p-8 text-center cursor-pointer border-2 border-dashed transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.txt,.md"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-200">{progressText}</p>
            <p className="text-xs text-slate-400 mt-1">Extracting text & vectorizing chunks into Qdrant</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              Upload Study Material (Multiple Files Supported)
            </h3>
            <p className="text-sm text-slate-400 mb-4 max-w-md">
              Drag & Drop your documents here, or <span className="text-indigo-400 font-semibold underline">browse files</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">PDF</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">DOCX</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">PPTX</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">TXT</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">Markdown</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
