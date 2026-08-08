import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { documentApi, flashcardApi } from '../services/api';
import { Document, Flashcard } from '../types';
import { FlipCardDeck } from '../components/flashcard/FlipCardDeck';
import { Layers, Sparkles, Loader2, BookOpen } from 'lucide-react';

export const FlashcardsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const docParam = searchParams.get('doc');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(
    docParam ? parseInt(docParam) : null
  );
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const data = await documentApi.list();
        const completed = data.filter((d) => d.status === 'completed');
        setDocuments(completed);
        if (!selectedDocId && completed.length > 0) {
          setSelectedDocId(completed[0].id);
        }
      } catch (err) {
        console.error("Failed to load documents:", err);
      }
    };
    loadDocs();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      loadFlashcards(selectedDocId);
    }
  }, [selectedDocId]);

  const loadFlashcards = async (docId: number) => {
    setLoading(true);
    try {
      const data = await flashcardApi.list(docId);
      if (data.length === 0) {
        // Auto-generate if empty deck
        const generated = await flashcardApi.generate(docId, undefined, 10);
        setFlashcards(generated);
      } else {
        setFlashcards(data);
      }
    } catch (err) {
      console.error("Failed to load flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewDeck = async () => {
    if (!selectedDocId) return;
    setLoading(true);
    try {
      const generated = await flashcardApi.generate(selectedDocId, undefined, 10);
      setFlashcards(generated);
    } catch (err) {
      alert("Failed to generate new flashcard deck.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            AI Flashcard Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Study definitions, key concepts, formulas, and terminology generated from your study documents.
          </p>
        </div>

        {selectedDocId && (
          <button
            onClick={handleGenerateNewDeck}
            disabled={loading}
            className="glow-button px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate New Deck
          </button>
        )}
      </div>

      {/* Document Selector */}
      {documents.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0">Study Document:</span>
          <select
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(Number(e.target.value))}
            className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.filename}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3D Flip Card Deck */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-300">Generating Flashcards with AI...</p>
        </div>
      ) : (
        <FlipCardDeck cards={flashcards} />
      )}
    </div>
  );
};
