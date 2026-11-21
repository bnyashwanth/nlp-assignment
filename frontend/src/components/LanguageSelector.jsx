/**
 * LinguaBridge AI - LanguageSelector Component
 * ============================================
 * Module: frontend/src/components/LanguageSelector.jsx
 * 
 * Supports multilingual translation:
 * - English (eng_Latn) ↔ Kannada (kan_Knda)
 * - English (eng_Latn) ↔ Hindi (hin_Deva)
 * 
 * Features:
 * - Interactive source and target dropdowns with flag emojis and native script names
 * - One-click target language switch pills between Kannada and Hindi
 * - Bi-directional language swapping (onSwap)
 * - Model architecture selector (Baseline, LoRA Fine-Tuned, LoRA + Back-Translation)
 */

import React from 'react';
import { ArrowLeftRight, Check, Zap, Globe2 } from 'lucide-react';

export const LANGUAGES = [
  { code: 'eng_Latn', iso: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'kan_Knda', iso: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'hin_Deva', iso: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tam_Taml', iso: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'tel_Telu', iso: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
];

const MODEL_VARIANTS = [
  {
    id: 'lora_bt',
    title: 'LoRA + Back-Translation',
    badge: '⭐ Recommended (Augmented)',
    color: 'emerald',
  },
  {
    id: 'lora',
    title: 'LoRA Fine-Tuned',
    badge: 'PEFT Parallel Only',
    color: 'blue',
  },
  {
    id: 'baseline',
    title: 'Baseline NLLB-200',
    badge: 'Pretrained 600M Base',
    color: 'slate',
  },
];

export default function LanguageSelector({
  sourceLang,
  targetLang,
  onSwap,
  onChangeSource,
  onChangeTarget,
  modelVariant,
  onModelChange,
}) {
  const currentSource = LANGUAGES.find((l) => l.code === sourceLang) || LANGUAGES[0];
  const currentTarget = LANGUAGES.find((l) => l.code === targetLang) || LANGUAGES[1];

  /**
   * Handle quick target switch between Kannada and Hindi
   */
  const handleQuickTargetSelect = (code) => {
    if (onChangeTarget) {
      onChangeTarget(code);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-6 space-y-4">
      {/* Top Bar: Language Selectors & Swap Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Source & Target Dropdowns / Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap sm:flex-nowrap">
          
          {/* Source Language Picker */}
          <div className="relative">
            <select
              value={sourceLang}
              onChange={(e) => onChangeSource && onChangeSource(e.target.value)}
              className="appearance-none bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl pl-3 pr-8 py-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all shadow-xs"
              title="Select source language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label} ({lang.native})
                </option>
              ))}
            </select>
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

          {/* Target Language Picker */}
          <div className="relative">
            <select
              value={targetLang}
              onChange={(e) => onChangeTarget && onChangeTarget(e.target.value)}
              className="appearance-none bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl pl-3 pr-8 py-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all shadow-xs"
              title="Select target language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label} ({lang.native})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Target Switch Pills (Kannada, Hindi, Tamil, Telugu) */}
          <div className="flex items-center space-x-1.5 ml-1 flex-wrap gap-y-1">
            <button
              type="button"
              onClick={() => handleQuickTargetSelect('kan_Knda')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border ${
                targetLang === 'kan_Knda'
                  ? 'bg-amber-100/80 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
              title="Set target to Kannada"
            >
              ಕನ್ನಡ (kn)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTargetSelect('hin_Deva')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border ${
                targetLang === 'hin_Deva'
                  ? 'bg-amber-100/80 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
              title="Set target to Hindi"
            >
              हिन्दी (hi)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTargetSelect('tam_Taml')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border ${
                targetLang === 'tam_Taml'
                  ? 'bg-amber-100/80 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
              title="Set target to Tamil"
            >
              தமிழ் (ta)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTargetSelect('tel_Telu')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border ${
                targetLang === 'tel_Telu'
                  ? 'bg-amber-100/80 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
              title="Set target to Telugu"
            >
              తెలుగు (te)
            </button>
          </div>

        </div>

        {/* Translation Mode Badge / Direction Tag */}
        <div className="text-xs font-medium text-slate-500 flex items-center space-x-1.5 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Seq2Seq Beam Decoding (4 Beams)</span>
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
