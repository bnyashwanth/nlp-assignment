/**
 * LinguaBridge AI - TranslatorPanel Component
 * ===========================================
 * Module: frontend/src/components/TranslatorPanel.jsx
 * Input text panel with character counter, sample injection, clear button,
 * and translation execution buttons with loading states.
 */

import React from 'react';
import { ArrowRight, Columns, Loader2, Sparkles, X } from 'lucide-react';

const SAMPLES = [
  "The government announced new educational policies for rural schools.",
  "Bengaluru is widely known as the silicon capital of India.",
  "Artificial Intelligence is transforming regional language translation.",
  "Healthcare centers in remote villages need reliable electric power.",
  "Higher education institutions must promote entrepreneurship and innovation."
];

export default function TranslatorPanel({
  sourceText,
  onChangeText,
  onTranslate,
  onCompare,
  onClear,
  isLoading,
  isComparing,
  sourceLang,
  maxChars = 2000,
}) {
  const charLength = sourceText.length;
  const isOverLimit = charLength > maxChars;

  const handlePickRandomSample = () => {
    const randomItem = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    onChangeText(randomItem);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 flex flex-col h-full overflow-hidden">
      
      {/* Card Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Source Text ({sourceLang === 'eng_Latn' ? 'English' : sourceLang === 'hin_Deva' ? 'Hindi' : 'Kannada'})
        </span>

        {/* Quick Sample Trigger */}
        <button
          type="button"
          onClick={handlePickRandomSample}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/80 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Insert Sample</span>
        </button>
      </div>

      {/* Input Textarea */}
      <div className="p-4 flex-1 flex flex-col min-h-[220px]">
        <textarea
          value={sourceText}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={
            sourceLang === 'eng_Latn'
              ? "Type or paste English text to translate... (e.g., 'The government announced new educational policies for rural schools.')"
              : sourceLang === 'hin_Deva'
              ? "यहाँ हिन्दी पाठ दर्ज करें... (e.g., 'सरकार ने ग्रामीण स्कूलों के लिए नई शैक्षिक नीतियों की घोषणा की।')"
              : "ಇಲ್ಲಿ ಕನ್ನಡ ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ... (e.g., 'ಗ್ರಾಮೀಣ ಶಾಲೆಗಳಿಗಾಗಿ ಸರ್ಕಾರವು ಹೊಸ ಶೈಕ್ಷಣಿಕ ನೀತಿಗಳನ್ನು ಪ್ರಕಟಿಸಿತು.')"
          }
          className="w-full flex-1 resize-none border-none outline-none text-slate-800 placeholder-slate-400 text-base leading-relaxed bg-transparent font-sans"
          disabled={isLoading || isComparing}
        />
      </div>

      {/* Card Footer: Character Counter & Actions */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex flex-wrap items-center justify-between gap-3">
        
        {/* Character Count */}
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium ${isOverLimit ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
            {charLength.toLocaleString()} / {maxChars.toLocaleString()} chars
          </span>
          {sourceText && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center space-x-1 transition-colors"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          
          {/* Side-by-Side Comparison Button */}
          <button
            type="button"
            onClick={onCompare}
            disabled={!sourceText.trim() || isLoading || isComparing || isOverLimit}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
            title="Translate across Baseline, LoRA, and LoRA+BT"
          >
            {isComparing ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            ) : (
              <Columns className="w-4 h-4 text-slate-500" />
            )}
            <span>Compare Models</span>
          </button>

          {/* Primary Translate Button */}
          <button
            type="button"
            onClick={() => onTranslate()}
            disabled={!sourceText.trim() || isLoading || isComparing || isOverLimit}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-brand-500/25 transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <span>Translate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
