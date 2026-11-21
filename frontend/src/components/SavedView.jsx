/**
 * LinguaBridge AI - Saved Translations View (3-Color System)
 * ==========================================================
 * Module: frontend/src/components/SavedView.jsx
 * 
 * Strict 3-Color System:
 * - Surface: Crisp White (#FFFFFF) & Soft Off-White (#F5F5F7), Border (#E5E5EA)
 * - Primary Ink: Deep Charcoal (#1D1D1F), Secondary: Muted Gray (#6E6E73)
 * - Single Accent: Deep Teal (#0F766E)
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
    engine: '22RI52 Pure-NLP',
    pairBadge: 'ENG → KAN',
    fontClass: 'font-kannada',
  },
  {
    id: 'saved-2',
    sourceText: 'Where is the nearest station?',
    translatedText: 'निकटतम स्टेशन कहाँ है?',
    sourceLang: 'eng_Latn',
    targetLang: 'hin_Deva',
    category: 'Hindi',
    engine: 'Offline NLP Cache',
    pairBadge: 'ENG → HIN',
    fontClass: 'font-devanagari',
  },
  {
    id: 'saved-3',
    sourceText: 'Thank you for your help.',
    translatedText: 'உங்கள் உதவிக்கு நன்றி.',
    sourceLang: 'eng_Latn',
    targetLang: 'tam_Taml',
    category: 'Tamil & Telugu',
    engine: '22RI52 Pure-NLP',
    pairBadge: 'ENG → TAM',
    fontClass: 'font-tamil',
  },
  {
    id: 'saved-4',
    sourceText: 'See you tomorrow.',
    translatedText: 'రేపు కలుద్దాం.',
    sourceLang: 'eng_Latn',
    targetLang: 'tel_Telu',
    category: 'Tamil & Telugu',
    engine: '22RI52 Pure-NLP',
    pairBadge: 'ENG → TEL',
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
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
          Words worth keeping.
        </h2>
        <p className="text-sm text-[#6E6E73] mt-1">
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
              className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all ${
                filterCategory === cat
                  ? 'bg-[#1D1D1F] text-white shadow-xs'
                  : 'bg-white text-[#6E6E73] hover:text-[#1D1D1F] border border-[#E5E5EA]'
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
            className="w-full sm:w-64 bg-white border border-[#E5E5EA] rounded-[12px] px-3.5 py-1.5 pl-8 text-xs text-[#1D1D1F] outline-none soft-shadow"
          />
          <Search className="w-3.5 h-3.5 text-[#6E6E73] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Saved Translation Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[18px] border border-[#E5E5EA] soft-shadow">
            <Star className="w-8 h-8 text-[#6E6E73]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#1D1D1F]">No saved translations found</p>
            <p className="text-xs text-[#6E6E73] mt-1">
              Click the star icon in the Translate tab to bookmark any translation here.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-[#E5E5EA] hover:border-[#0F766E] rounded-[18px] soft-shadow transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]">
                    {item.pairBadge || 'ENG → KAN'}
                  </span>
                  <span className="text-[10px] font-medium text-[#6E6E73]">
                    {item.engine || '22RI52 Pure-NLP'}
                  </span>
                </div>
                <p className="text-xs text-[#6E6E73]">{item.sourceText}</p>
                <p className={`text-base ${item.fontClass || 'font-sans'} font-bold text-[#1D1D1F]`}>
                  {item.translatedText}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSelectToTranslate && onSelectToTranslate(item)}
                  className="p-2 rounded-xl text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                  title="Open in translator"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.translatedText)}
                  className="p-2 rounded-xl text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                  title="Copy translation"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-[#0F766E]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
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
