/**
 * LinguaBridge AI - Translation History Full View
 * ===============================================
 * Module: frontend/src/components/HistoryView.jsx
 * 
 * Features:
 * - Search and language filter for saved translation history
 * - Mode tags (Online NLLB/LoRA vs Offline ML Kit)
 * - Click to restore into active translation editor
 * - Clear history action
 */

import React, { useState } from 'react';
import { Search, Clock, Trash2, ArrowUpRight, Copy, Check, Smartphone, Cloud } from 'lucide-react';

export default function HistoryView({
  history = [],
  onSelectHistoryItem,
  onClearHistory,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (e) {
      console.warn(e);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.sourceText?.toLowerCase().includes(q) ||
      item.translatedText?.toLowerCase().includes(q) ||
      item.sourceLang?.toLowerCase().includes(q) ||
      item.targetLang?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Translation History.
          </h2>
          <p className="text-sm text-[#6E6E73] mt-1">
            Review past translations, restore queries, or manage local history records.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="px-4 py-2 rounded-[14px] text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] border border-[#E5E5EA] self-start sm:self-center transition-colors flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search past translations..."
          className="w-full bg-white border border-[#E5E5EA] rounded-[18px] px-5 py-3.5 pl-11 text-sm text-[#1D1D1F] outline-none soft-shadow focus:border-[#0F766E]"
        />
        <Search className="w-4 h-4 text-[#6E6E73] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[20px] border border-[#E5E5EA] soft-shadow">
            <Clock className="w-8 h-8 text-[#6E6E73]/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#1D1D1F]">No history records found</p>
            <p className="text-xs text-[#6E6E73] mt-1">
              Your recent queries will appear here automatically when you translate.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-[#E5E5EA] hover:border-[#0F766E]/40 rounded-[20px] soft-shadow transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]">
                    {item.sourceLang?.split('_')[0].toUpperCase()} → {item.targetLang?.split('_')[0].toUpperCase()}
                  </span>

                  {item.translationMode === 'offline' ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-[#6E6E73] bg-[#F5F5F7] px-2 py-0.5 rounded-full border border-[#E5E5EA]">
                      <Smartphone className="w-3 h-3 text-[#6E6E73]" />
                      <span>{item.isLocalFallback ? 'Offline NLP Cache' : 'Offline Pure-NLP Engine'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-[#0F766E] bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#0F766E]/20">
                      <Cloud className="w-3 h-3 text-[#0F766E]" />
                      <span>Online Python NLLB-200</span>
                    </span>
                  )}

                  {item.latencyMs && (
                    <span className="text-[10px] text-[#6E6E73] font-mono">
                      {item.latencyMs.toFixed(0)}ms
                    </span>
                  )}

                  <span className="text-[10px] text-[#6E6E73]">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-[#6E6E73]">{item.sourceText}</p>
                <p className="text-base font-bold text-[#1D1D1F]">{item.translatedText}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSelectHistoryItem(item)}
                  className="p-2 rounded-xl text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                  title="Load into translator"
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
