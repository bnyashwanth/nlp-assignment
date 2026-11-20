/**
 * LinguaBridge AI - HistoryPanel Component
 * =========================================
 * Module: frontend/src/components/HistoryPanel.jsx
 * 
 * Modal dialog for browsing, restoring, or clearing persisted local translation history.
 * Displays mode badges indicating whether each translation was generated using the
 * "Online Backend (NLLB/LoRA)" or the "Offline On-Device Model".
 */

import React from 'react';
import {
  Clock,
  Trash2,
  X,
  ArrowRight,
  CornerDownLeft,
  Cloud,
  Smartphone,
  Zap,
} from 'lucide-react';

export default function HistoryPanel({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-base">Translation History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
              {history.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-rose-50 flex items-center space-x-1 transition-colors"
                title="Clear all saved history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-10 h-10 mx-auto text-slate-200 mb-2" />
              <p className="text-sm font-medium">No recent translations yet.</p>
              <p className="text-xs text-slate-400 mt-1">Translations you generate will be automatically saved here.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="group p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 cursor-pointer transition-all shadow-sm space-y-2 relative"
              >
                {/* Meta row: languages, timestamp, and Mode Badge */}
                <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5 font-medium text-slate-500">
                    <span className="uppercase font-mono">{item.sourceLang.split('_')[0]}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="uppercase font-mono">{item.targetLang.split('_')[0]}</span>
                    <span className="text-slate-300">&bull;</span>
                    
                    {/* Mode Badge in History item */}
                    {item.translationMode === 'offline' ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                        <Smartphone className="w-3 h-3 text-amber-600" />
                        <span>{item.isLocalFallback ? 'Local Offline Fallback' : 'ML Kit On-Device'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <Cloud className="w-3 h-3 text-blue-600" />
                        <span>Online Backend</span>
                      </span>
                    )}

                    {item.latencyMs !== null && item.latencyMs !== undefined && (
                      <span className="inline-flex items-center text-[10px] font-mono text-slate-400 ml-1">
                        <Zap className="w-2.5 h-2.5 text-emerald-500 mr-0.5" />
                        {item.latencyMs}ms
                      </span>
                    )}
                  </div>

                  <span className="text-[11px]">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-sm text-slate-700 font-medium line-clamp-2">
                  {item.sourceText}
                </p>

                <p className="text-sm text-slate-900 font-kannada font-semibold line-clamp-2">
                  {item.translatedText}
                </p>

                <div className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 text-xs font-semibold text-brand-600 flex items-center space-x-1 transition-opacity">
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center">
          Translations are stored locally on your device in browser/app storage.
        </div>

      </div>
    </div>
  );
}
