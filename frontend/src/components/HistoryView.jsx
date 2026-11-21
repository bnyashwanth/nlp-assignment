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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202124]">
            Translation History.
          </h2>
          <p className="text-sm text-[#858B98] mt-1">
            Review past translations, restore queries, or manage local history records.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="px-4 py-2 rounded-[14px] text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 self-start sm:self-center transition-colors flex items-center space-x-1.5"
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
          className="w-full bg-white border border-[#E5E7EB] rounded-[18px] px-5 py-3.5 pl-11 text-sm text-[#202124] outline-none soft-shadow"
        />
        <Search className="w-4 h-4 text-[#858B98] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[20px] border border-[#E5E7EB] soft-shadow">
            <Clock className="w-8 h-8 text-[#858B98]/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#202124]">No history records found</p>
            <p className="text-xs text-[#858B98] mt-1">
              Your recent queries will appear here automatically when you translate.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-[#E5E7EB] hover:border-[#E03A3E]/40 rounded-[20px] soft-shadow transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0F2F6] text-[#202124] border border-[#E5E7EB]">
                    {item.sourceLang?.split('_')[0].toUpperCase()} → {item.targetLang?.split('_')[0].toUpperCase()}
                  </span>

                  {item.translationMode === 'offline' ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-[#9E6E00] bg-[#FDB827]/15 px-2 py-0.5 rounded-full border border-[#FDB827]/30">
                      <Smartphone className="w-3 h-3 text-[#FDB827]" />
                      <span>{item.isLocalFallback ? 'Offline NLP Cache' : 'Offline Pure-NLP Engine'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-[#009DDC] bg-[#009DDC]/10 px-2 py-0.5 rounded-full border border-[#009DDC]/20">
                      <Cloud className="w-3 h-3 text-[#009DDC]" />
                      <span>Online Python NLLB-200</span>
                    </span>
                  )}

                  {item.latencyMs && (
                    <span className="text-[10px] text-[#858B98] font-mono">
                      {item.latencyMs.toFixed(0)}ms
                    </span>
                  )}

                  <span className="text-[10px] text-[#858B98]">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-[#858B98]">{item.sourceText}</p>
                <p className="text-base font-bold text-[#202124]">{item.translatedText}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSelectHistoryItem(item)}
                  className="p-2 rounded-xl text-[#858B98] hover:text-[#202124] hover:bg-[#F0F2F6] transition-colors"
                  title="Load into translator"
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
