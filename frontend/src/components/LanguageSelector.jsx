/**
 * LinguaBridge AI - LanguageSelector Component
 * ============================================
 * Module: frontend/src/components/LanguageSelector.jsx
 * Provides interactive language direction swapping and model architecture selector pills.
 */

import React from 'react';
import { ArrowLeftRight, Check, Zap } from 'lucide-react';

const LANGUAGES = [
  { code: 'eng_Latn', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'kan_Knda', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
];

const MODEL_VARIANTS = [
  {
    id: 'lora_bt',
    title: 'LoRA + Back-Translation',
    badge: '⭐ Recommended (BLEU 29.35 / chrF 57.80)',
    color: 'emerald',
  },
  {
    id: 'lora',
    title: 'LoRA Fine-Tuned',
    badge: 'Parallel Only (BLEU 25.80 / chrF 52.65)',
    color: 'blue',
  },
  {
    id: 'baseline',
    title: 'Baseline NLLB-200',
    badge: 'Pretrained 600M (BLEU 18.45 / chrF 41.20)',
    color: 'slate',
  },
];

export default function LanguageSelector({
  sourceLang,
  targetLang,
  onSwap,
  modelVariant,
  onModelChange,
}) {
  const currentSource = LANGUAGES.find((l) => l.code === sourceLang) || LANGUAGES[0];
  const currentTarget = LANGUAGES.find((l) => l.code === targetLang) || LANGUAGES[1];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-6 space-y-4">
      {/* Top Bar: Language Pairs & Swap Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Source Language Tag */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-sm font-semibold text-slate-800">
            <span>{currentSource.flag}</span>
            <span>{currentSource.label}</span>
            <span className="text-xs text-slate-400 font-normal">({currentSource.code})</span>
          </div>

          {/* Swap Button */}
          <button
            onClick={onSwap}
            type="button"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 border border-slate-200 hover:border-brand-200 text-slate-600 transition-all active:scale-95 shadow-sm"
            title="Swap source and target languages"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Target Language Tag */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-sm font-semibold text-slate-800">
            <span>{currentTarget.flag}</span>
            <span>{currentTarget.label}</span>
            <span className="text-xs text-slate-400 font-normal">({currentTarget.code})</span>
          </div>
        </div>

        {/* Translation Direction Label */}
        <div className="text-xs font-medium text-slate-500 flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Autoregressive Beam Search (Beam Width: 4)</span>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Model Architecture Selector Pills */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Model Architecture
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {MODEL_VARIANTS.map((variant) => {
            const isSelected = modelVariant === variant.id;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onModelChange(variant.id)}
                className={`flex flex-col text-left p-3 rounded-xl border text-sm transition-all ${
                  isSelected
                    ? 'bg-brand-50/70 border-brand-500 text-brand-900 shadow-sm ring-1 ring-brand-500/20'
                    : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold">{variant.title}</span>
                  {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 font-mono">{variant.badge}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
