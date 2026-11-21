/**
 * LinguaBridge AI - Saved Translations View
 * ==========================================
 * Module: frontend/src/components/SavedView.jsx
 * 
 * Features:
 * - Category filter pills (All saved, Kannada, Hindi, Tamil & Telugu, Phrases)
 * - Direction badges (ENG → KAN, ENG → HIN, ENG → TAM, ENG → TEL)
 * - Copy to clipboard, delete item, and "Translate Again" action
 * - Persisted in browser localStorage
 */

import React, { useState } from 'react';
import { Search, Star, Copy, Trash2, ArrowUpRight, Check } from 'lucide-react';

const DEFAULT_SAVED_ITEMS = [
  {
    id: 'saved-1',
    sourceText: 'Good morning.',
    translatedText: 'ಶುಭೋದಯ.',
    sourceLang: 'eng_Latn',
    targetLang: 'kan_Knda',
    category: 'Kannada',
    engine: 'NLLB/LoRA',
    pairBadge: 'ENG → KAN',
    badgeBg: 'bg-[#FDB827]/15',
    badgeText: 'text-[#9E6E00]',
    badgeBorder: 'border-[#FDB827]/30',
    fontClass: 'font-kannada',
  },
  {
    id: 'saved-2',
    sourceText: 'Where is the nearest station?',
    translatedText: 'निकटतम स्टेशन कहाँ है?',
    sourceLang: 'eng_Latn',
    targetLang: 'hin_Deva',
    category: 'Hindi',
    engine: 'Offline Cache',
    pairBadge: 'ENG → HIN',
    badgeBg: 'bg-[#E03A3E]/10',
    badgeText: 'text-[#E03A3E]',
    badgeBorder: 'border-[#E03A3E]/20',
    fontClass: 'font-devanagari',
  },
  {
    id: 'saved-3',
    sourceText: 'Thank you for your help.',
    translatedText: 'உங்கள் உதவிக்கு நன்றி.',
    sourceLang: 'eng_Latn',
    targetLang: 'tam_Taml',
    category: 'Tamil & Telugu',
    engine: 'NLLB/LoRA',
    pairBadge: 'ENG → TAM',
    badgeBg: 'bg-[#963D97]/10',
    badgeText: 'text-[#963D97]',
    badgeBorder: 'border-[#963D97]/20',
    fontClass: 'font-tamil',
  },
  {
    id: 'saved-4',
    sourceText: 'See you tomorrow.',
    translatedText: 'రేపు కలుద్దాం.',
    sourceLang: 'eng_Latn',
    targetLang: 'tel_Telu',
    category: 'Tamil & Telugu',
    engine: 'NLLB/LoRA',
    pairBadge: 'ENG → TEL',
    badgeBg: 'bg-[#009DDC]/10',
    badgeText: 'text-[#009DDC]',
    badgeBorder: 'border-[#009DDC]/20',
    fontClass: 'font-telugu',
  },
];

const SAVED_STORAGE_KEY = 'linguabridge_saved_translations';

export default function SavedView({ onSelectToTranslate }) {
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SAVED_ITEMS;
    } catch {
      return DEFAULT_SAVED_ITEMS;
    }
  });

  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const saveToStorage = (items) => {
    setSavedItems(items);
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };

  const handleDelete = (id) => {
    const updated = savedItems.filter((item) => item.id !== id);
    saveToStorage(updated);
  };

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (e) {
      console.warn(e);
    }
  };

  const filteredItems = savedItems.filter((item) => {
    if (filterCategory === 'Kannada' && item.targetLang !== 'kan_Knda') return false;
    if (filterCategory === 'Hindi' && item.targetLang !== 'hin_Deva') return false;
    if (filterCategory === 'Tamil & Telugu' && !['tam_Taml', 'tel_Telu'].includes(item.targetLang)) return false;
    if (filterCategory === 'Phrases' && item.sourceText.length > 50) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.sourceText.toLowerCase().includes(q) ||
        item.translatedText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202124]">
          Words worth keeping.
        </h2>
        <p className="text-sm text-[#858B98] mt-1">
          Your saved English, Kannada, Hindi, Tamil, and Telugu translations.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['All', 'Kannada', 'Hindi', 'Tamil & Telugu', 'Phrases'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                filterCategory === cat
                  ? 'bg-white text-[#202124] border border-[#E5E7EB] soft-shadow'
                  : 'text-[#858B98] hover:text-[#202124] hover:bg-[#F0F2F6]'
              }`}
            >
              {cat} {cat === 'All' ? `(${savedItems.length})` : ''}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter saved phrases..."
            className="w-full sm:w-64 bg-white border border-[#E5E7EB] rounded-[14px] px-3.5 py-1.5 pl-8 text-xs text-[#202124] outline-none soft-shadow"
          />
          <Search className="w-3.5 h-3.5 text-[#858B98] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Saved Translation Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[20px] border border-[#E5E7EB] soft-shadow">
            <Star className="w-8 h-8 text-[#FDB827]/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#202124]">No saved translations found</p>
            <p className="text-xs text-[#858B98] mt-1">
              Click the star icon on any translation in the Translate tab to bookmark it here.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-[#E5E7EB] hover:border-[#FDB827]/60 rounded-[20px] soft-shadow transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${item.badgeBg || 'bg-[#FDB827]/15'} ${item.badgeText || 'text-[#9E6E00]'} border ${item.badgeBorder || 'border-[#FDB827]/30'}`}
                  >
                    {item.pairBadge || 'ENG → KAN'}
                  </span>
                  <span className="text-[10px] font-medium text-[#858B98]">
                    {item.engine || 'NLLB/LoRA'}
                  </span>
                </div>
                <p className="text-xs text-[#858B98]">{item.sourceText}</p>
                <p className={`text-base ${item.fontClass || 'font-sans'} font-bold text-[#202124]`}>
                  {item.translatedText}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSelectToTranslate && onSelectToTranslate(item)}
                  className="p-2 rounded-xl text-[#858B98] hover:text-[#202124] hover:bg-[#F0F2F6] transition-colors"
                  title="Open in translator"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.translatedText)}
                  className="p-2 rounded-xl text-[#858B98] hover:text-[#202124] hover:bg-[#F0F2F6] transition-colors"
                  title="Copy translation"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl text-[#858B98] hover:text-[#E03A3E] hover:bg-rose-50 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
