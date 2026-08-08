import React, { useState, useEffect } from 'react';
import { Flashcard } from '../../types';
import { RotateCw, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { flashcardApi } from '../../services/api';

interface FlipCardDeckProps {
  cards: Flashcard[];
}

export const FlipCardDeck: React.FC<FlipCardDeckProps> = ({ cards: initialCards }) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [initialCards]);

  if (cards.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
        <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">No Flashcards Available</h3>
        <p className="text-xs text-slate-400 mt-1">Select a document above to generate an AI study deck!</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleToggleMastered = async (status: boolean) => {
    try {
      const updated = await flashcardApi.updateStatus(currentCard.id, status);
      setCards((prev) =>
        prev.map((c) => (c.id === currentCard.id ? { ...c, is_mastered: status } : c))
      );
      handleNext();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Progress Counter */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-400">
          {currentCard.category} • {currentCard.topic}
        </span>
        <span>{cards.filter(c => c.is_mastered).length} Mastered</span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 perspective-1000 cursor-pointer group"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 w-full h-full glass-panel rounded-3xl p-8 border border-indigo-500/20 backface-hidden flex flex-col justify-between shadow-2xl group-hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">FRONT</span>
              <RotateCw className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="text-center my-auto">
              <h3 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug">
                {currentCard.front}
              </h3>
            </div>
            <div className="text-center text-xs text-slate-500 font-medium">
              Click or press Space to flip
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 w-full h-full glass-panel rounded-3xl p-8 border border-emerald-500/30 rotate-y-180 backface-hidden flex flex-col justify-between bg-slate-900/90 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">BACK / EXPLANATION</span>
              <RotateCw className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-center my-auto">
              <p className="text-base text-slate-200 leading-relaxed font-medium">
                {currentCard.back}
              </p>
            </div>
            <div className="text-center text-xs text-slate-500 font-medium">
              Click to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Previous Card"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => handleToggleMastered(false)}
            className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Needs Review
          </button>
          <button
            onClick={() => handleToggleMastered(true)}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mastered
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Next Card"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
