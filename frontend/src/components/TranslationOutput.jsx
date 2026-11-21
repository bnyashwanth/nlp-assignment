/**
 * LinguaBridge AI - TranslationOutput Component
 * =============================================
 * Module: frontend/src/components/TranslationOutput.jsx
 * 
 * Target translation display panel featuring:
 * - Dynamic Mode Badge: Displays "Online Backend (NLLB/LoRA)" or "Offline On-Device Model"
 * - Millisecond latency indicator
 * - Copy to clipboard functionality
 * - Visual loading animation with spinner
 */

import React, { useState } from 'react';
import {
  Check,
  Copy,
  Sparkles,
  Zap,
  Cloud,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function TranslationOutput({
  translatedText,
  isLoading,
  targetLang,
  modelVariant,
  latency,
  translationMode,
  translationEngine,
  isFallback = false,
  isLocalFallback = false,
}) {
  const [copied, setCopied] = useState(false);

  /**
   * Copies the translated text to the user's system clipboard
   */
  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  /**
   * Returns human-readable label for the active architecture variant
   */
  const getModelLabel = () => {
    if (translationMode === 'offline') {
      return isLocalFallback
        ? 'Bundled Local Phrase Dictionary'
        : 'Google ML Kit (On-Device Neural Model)';
    }
    switch (modelVariant) {
      case 'lora_bt':
        return 'LoRA + Back-Translation (Augmented)';
      case 'lora':
        return 'LoRA Fine-Tuned (Parallel Only)';
      case 'baseline':
        return 'Baseline Pretrained NLLB-200';
      default:
        return modelVariant || 'NLLB-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 flex flex-col h-full overflow-hidden">
      
      {/* Card Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Translation ({targetLang === 'kan_Knda' ? 'Kannada' : targetLang === 'hin_Deva' ? 'Hindi' : 'English'})
          </span>

          {/* Mode Badge: Online Backend vs Offline On-Device Model */}
          {translatedText && !isLoading && (
            translationMode === 'offline' ? (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs animate-fadeIn">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>{isLocalFallback ? 'Local Offline Fallback' : 'ML Kit On-Device Model'}</span>
                {isFallback && (
                  <span className="ml-1 text-[10px] text-amber-600 font-semibold">(Fallback)</span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 shadow-xs animate-fadeIn">
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Online Backend (NLLB/LoRA)</span>
              </span>
            )
          )}
        </div>

        {/* Latency Indicator */}
        {latency !== null && !isLoading && (
          <span className="inline-flex items-center space-x-1 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span>{latency} ms</span>
          </span>
        )}
      </div>

      {/* Output Content Area */}
      <div className="p-4 flex-1 flex flex-col min-h-[220px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-12 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
            <p className="text-sm font-medium animate-pulse">
              Translating with {translationMode === 'offline' ? 'On-Device ML Kit' : 'NLLB-200 LoRA'}...
            </p>
          </div>
        ) : translatedText ? (
          <div className="w-full flex-1 text-slate-900 text-lg leading-relaxed font-kannada select-text">
            {translatedText}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-300 select-none">
            <Sparkles className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-sm text-slate-400">Translation will appear here</p>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between flex-wrap gap-2">
        
        {/* Model Tag & Engine Description */}
        <div className="text-xs text-slate-500 truncate max-w-[280px]">
          <span className="font-medium text-slate-700">Engine:</span>{' '}
          <span className="font-semibold text-slate-800">
            {translationEngine || getModelLabel()}
          </span>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!translatedText || isLoading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
}
