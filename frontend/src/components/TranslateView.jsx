/**
 * LinguaBridge AI - Translate Workspace View (Apple-Inspired UI + Pure-NLP Engine)
 * =================================================================================
 * Module: frontend/src/components/TranslateView.jsx
 * 
 * Features:
 * - Dual 360px white cards with rounded-[22px], soft-shadow, and thin borders
 * - Embedded language selectors in card headers with NFC badge and Mode status
 * - Floating circular swap button with smooth hover/rotate animation
 * - Clear Mode Badges:
 *   - 'Online Python NLLB-200'
 *   - 'Offline NLP Cache'
 *   - 'Offline Pure-NLP Engine'
 * - Expandable "NLP Pipeline Details" section showing:
 *   - Multilingual tokens (Exp 1)
 *   - Stemmed forms (Exp 1)
 *   - Minimum Edit Distance typo corrections (Exp 3)
 *   - Matched N-gram phrases (Exp 2)
 *   - SVO -> SOV Indic reordering transformation
 * - Multi-band Apple gradient action button
 * - Native Indic typography (Noto Sans Kannada, Devanagari, Tamil, Telugu)
 * - Direct bookmarking into Saved translations
 */

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowRight,
  Copy,
  Check,
  Star,
  Volume2,
  Sparkles,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Zap,
  Globe2,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { LANGUAGES } from './LanguageSelector';

const SAMPLES = [
  "The government announced new educational policies for rural schools.",
  "Bengaluru is widely known as the silicon capital of India.",
  "Artificial Intelligence is transforming regional language translation.",
  "Healthcare centers in remote villages need reliable electric power.",
  "Higher education institutions must promote entrepreneurship and innovation."
];

export default function TranslateView({
  sourceText,
  onChangeText,
  translatedText,
  sourceLang,
  targetLang,
  onChangeSource,
  onChangeTarget,
  onSwap,
  modelVariant,
  onModelChange,
  onTranslate,
  onCompare,
  onClear,
  isLoading,
  isComparing,
  latency,
  translationMode,
  translationEngine,
  nlpDiagnostics,
  isFallback,
  isLocalFallback,
  isConnected,
  isNative,
  onSwitchTab,
  onSaveTranslation,
  isSaved,
}) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showNlpDetails, setShowNlpDetails] = useState(false);

  const charLength = sourceText.length;
  const maxChars = 2000;

  const handlePickRandomSample = () => {
    const randomItem = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    onChangeText(randomItem);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSpeak = () => {
    if (!translatedText || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(translatedText);
      if (targetLang === 'hin_Deva') utterance.lang = 'hi-IN';
      else if (targetLang === 'tam_Taml') utterance.lang = 'ta-IN';
      else if (targetLang === 'tel_Telu') utterance.lang = 'te-IN';
      else if (targetLang === 'kan_Knda') utterance.lang = 'kn-IN';
      else utterance.lang = 'en-US';
      setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn(e);
      setSpeaking(false);
    }
  };

  // Font family determination for target language script
  const getTargetFontClass = () => {
    if (targetLang === 'kan_Knda') return 'font-kannada';
    if (targetLang === 'hin_Deva') return 'font-devanagari';
    if (targetLang === 'tam_Taml') return 'font-tamil';
    if (targetLang === 'tel_Telu') return 'font-telugu';
    return 'font-sans';
  };

  // Human-readable mode badge
  const renderModeBadge = () => {
    const eng = (translationEngine || '').toLowerCase();
    const isCache = eng.includes('cache');
    const isPureNLP = eng.includes('pure-nlp') || eng.includes('offline');
    const isOnline = eng.includes('python') || eng.includes('nllb') || eng.includes('online');

    if (isCache) {
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border text-[#30701F] bg-[#61BB46]/15 border-[#61BB46]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#61BB46]"></span>
          <span>Offline NLP Cache</span>
          {latency ? <span className="font-mono text-[10px]">&bull; {latency}ms</span> : null}
        </span>
      );
    }

    if (isPureNLP || !isConnected) {
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border text-[#9E6E00] bg-[#FDB827]/15 border-[#FDB827]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FDB827]"></span>
          <span>Offline Pure-NLP Engine</span>
          {latency ? <span className="font-mono text-[10px]">&bull; {latency}ms</span> : null}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border text-[#009DDC] bg-[#009DDC]/10 border-[#009DDC]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#009DDC] animate-pulse"></span>
        <span>Online Python NLLB-200</span>
        {latency ? <span className="font-mono text-[10px]">&bull; {latency}ms</span> : null}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202124]">
          Translate with clarity.
        </h2>
        <p className="text-sm text-[#858B98] mt-1">
          English, Kannada, Hindi, Tamil, and Telugu neural & pure-NLP offline translation.
        </p>
      </div>

      {/* Compact Model & Mode Strip */}
      <div className="flex items-center justify-between p-2.5 bg-white border border-[#E5E7EB] rounded-[18px] soft-shadow flex-wrap gap-2.5">
        
        {/* Architecture Segmented Control */}
        <div className="flex items-center p-1 bg-[#F0F2F6] rounded-[12px] space-x-1">
          <button
            type="button"
            onClick={() => onModelChange('lora_bt')}
            className={`px-3 py-1.5 text-xs rounded-[9px] transition-all ${
              modelVariant === 'lora_bt'
                ? 'font-bold bg-white text-[#202124] shadow-xs border border-[#E5E7EB]/80'
                : 'font-medium text-[#858B98] hover:text-[#202124]'
            }`}
          >
            LoRA + Back-Translation
          </button>
          <button
            type="button"
            onClick={() => onModelChange('lora')}
            className={`px-3 py-1.5 text-xs rounded-[9px] transition-all ${
              modelVariant === 'lora'
                ? 'font-bold bg-white text-[#202124] shadow-xs border border-[#E5E7EB]/80'
                : 'font-medium text-[#858B98] hover:text-[#202124]'
            }`}
          >
            LoRA Fine-Tuned
          </button>
          <button
            type="button"
            onClick={() => onModelChange('baseline')}
            className={`px-3 py-1.5 text-xs rounded-[9px] transition-all ${
              modelVariant === 'baseline'
                ? 'font-bold bg-white text-[#202124] shadow-xs border border-[#E5E7EB]/80'
                : 'font-medium text-[#858B98] hover:text-[#202124]'
            }`}
          >
            Base NLLB-200
          </button>
        </div>

        {/* Quick Target Language Pills & Offline Status */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
          <span className="text-xs text-[#858B98] font-medium mr-1 hidden sm:inline">Quick Target:</span>
          
          <button
            type="button"
            onClick={() => onChangeTarget('kan_Knda')}
            className={`px-2.5 py-1 rounded-[10px] text-xs transition-all ${
              targetLang === 'kan_Knda'
                ? 'font-bold bg-[#FDB827]/15 text-[#9E6E00] border border-[#FDB827]/40 shadow-xs'
                : 'font-medium bg-[#F0F2F6] text-[#858B98] hover:text-[#202124] border border-[#E5E7EB]'
            }`}
          >
            ಕನ್ನಡ kn
          </button>

          <button
            type="button"
            onClick={() => onChangeTarget('hin_Deva')}
            className={`px-2.5 py-1 rounded-[10px] text-xs transition-all ${
              targetLang === 'hin_Deva'
                ? 'font-bold bg-[#E03A3E]/10 text-[#E03A3E] border border-[#E03A3E]/30 shadow-xs'
                : 'font-medium bg-[#F0F2F6] text-[#858B98] hover:text-[#202124] border border-[#E5E7EB]'
            }`}
          >
            हिन्दी hi
          </button>

          <button
            type="button"
            onClick={() => onChangeTarget('tam_Taml')}
            className={`px-2.5 py-1 rounded-[10px] text-xs transition-all ${
              targetLang === 'tam_Taml'
                ? 'font-bold bg-[#963D97]/10 text-[#963D97] border border-[#963D97]/30 shadow-xs'
                : 'font-medium bg-[#F0F2F6] text-[#858B98] hover:text-[#202124] border border-[#E5E7EB]'
            }`}
          >
            தமிழ் ta
          </button>

          <button
            type="button"
            onClick={() => onChangeTarget('tel_Telu')}
            className={`px-2.5 py-1 rounded-[10px] text-xs transition-all ${
              targetLang === 'tel_Telu'
                ? 'font-bold bg-[#009DDC]/10 text-[#009DDC] border border-[#009DDC]/30 shadow-xs'
                : 'font-medium bg-[#F0F2F6] text-[#858B98] hover:text-[#202124] border border-[#E5E7EB]'
            }`}
          >
            తెలుగు te
          </button>

          <div className="h-4 w-[1px] bg-[#E5E7EB] mx-1"></div>

          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[10px] text-xs font-semibold bg-[#61BB46]/15 text-[#30701F] border border-[#61BB46]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#61BB46] animate-pulse"></span>
            <span>Pure-NLP Ready</span>
          </span>
        </div>
      </div>

      {/* TRANSLATION PANELS (Two Horizontal Cards + Floating Circular Swap) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative items-stretch">
        
        {/* LEFT CARD (Source) */}
        <div className="bg-white rounded-[22px] border border-[#E5E7EB] p-5 sm:p-6 soft-shadow flex flex-col justify-between min-h-[360px]">
          <div>
            {/* Header: Dropdown & Preprocessing Badge */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F2F6] gap-2 flex-wrap">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#858B98]">
                  Source
                </span>
                <div className="relative">
                  <select
                    value={sourceLang}
                    onChange={(e) => onChangeSource(e.target.value)}
                    className="appearance-none bg-[#F0F2F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] text-xs font-semibold rounded-[12px] pl-2.5 pr-7 py-1.5 cursor-pointer outline-none transition-all"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.label} ({lang.iso})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#858B98] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <span className="text-[11px] font-medium text-[#61BB46] bg-[#61BB46]/10 px-2.5 py-0.5 rounded-full border border-[#61BB46]/20">
                NFC Normalized • Tokenized
              </span>
            </div>

            {/* Input Area */}
            <div className="pt-4">
              <textarea
                value={sourceText}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder={
                  sourceLang === 'eng_Latn'
                    ? "Type or paste English text to translate... (e.g., 'The government announced new educational policies for rural schools.')"
                    : sourceLang === 'hin_Deva'
                    ? "यहाँ हिन्दी पाठ दर्ज करें..."
                    : sourceLang === 'tam_Taml'
                    ? "இங்கே தமிழ் உரையை உள்ளிடவும்..."
                    : sourceLang === 'tel_Telu'
                    ? "ఇక్కడ తెలుగు వచనాన్ని నమోదు చేయండి..."
                    : "ಇಲ್ಲಿ ಕನ್ನಡ ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ..."
                }
                className="w-full text-base leading-relaxed text-[#202124] font-normal resize-none outline-none bg-transparent placeholder-[#858B98] h-[180px]"
                disabled={isLoading || isComparing}
              />
            </div>
          </div>

          {/* Card Bottom Bar */}
          <div className="pt-3 border-t border-[#F0F2F6] flex items-center justify-between text-xs text-[#858B98]">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePickRandomSample}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#E03A3E] hover:text-[#963D97] bg-[#E03A3E]/10 hover:bg-[#E03A3E]/15 px-2.5 py-1 rounded-[10px] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sample</span>
              </button>
              {sourceText && (
                <button
                  type="button"
                  onClick={onClear}
                  className="p-1.5 rounded-lg hover:bg-[#F0F2F6] text-[#858B98] hover:text-[#202124] transition-colors"
                  title="Clear text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className={`font-mono text-[11px] ${charLength > maxChars ? 'text-rose-600 font-bold' : ''}`}>
              {charLength} / {maxChars}
            </span>
          </div>
        </div>

        {/* Circular Swap Button (Center Floating on Desktop) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            type="button"
            onClick={onSwap}
            className="w-11 h-11 rounded-full bg-white border border-[#E5E7EB] shadow-md hover:shadow-lg flex items-center justify-center text-[#202124] hover:border-[#E03A3E] transition-all hover:scale-105 active:scale-95 group"
            title="Swap source and target languages"
          >
            <ArrowLeftRight className="w-4 h-4 text-[#858B98] group-hover:text-[#E03A3E] transition-colors" />
          </button>
        </div>

        {/* RIGHT CARD (Target) */}
        <div className="bg-white rounded-[22px] border border-[#E5E7EB] p-5 sm:p-6 soft-shadow flex flex-col justify-between min-h-[360px]">
          <div>
            {/* Header: Dropdown & Mode Badge */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F2F6] gap-2 flex-wrap">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#858B98]">
                  Target
                </span>
                <div className="relative">
                  <select
                    value={targetLang}
                    onChange={(e) => onChangeTarget(e.target.value)}
                    className="appearance-none bg-[#F0F2F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] text-xs font-semibold rounded-[12px] pl-2.5 pr-7 py-1.5 cursor-pointer outline-none transition-all"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.native} ({lang.iso})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#858B98] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Dynamic Mode Badge */}
              {renderModeBadge()}
            </div>

            {/* Output Text Area */}
            <div className="pt-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[180px] text-[#858B98] space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#E03A3E]" />
                  <p className="text-xs font-medium">Translating via Seq2Seq / Pure-NLP Engine...</p>
                </div>
              ) : translatedText ? (
                <p
                  className={`${getTargetFontClass()} text-lg leading-relaxed text-[#202124] font-medium h-[180px] select-text overflow-y-auto`}
                >
                  {translatedText}
                </p>
              ) : (
                <p className="text-base leading-relaxed text-[#858B98]/60 italic h-[180px] flex items-center justify-center">
                  Translation will appear here...
                </p>
              )}
            </div>
          </div>

          {/* Card Bottom Bar: Actions */}
          <div className="pt-3 border-t border-[#F0F2F6] flex items-center justify-between text-xs text-[#858B98]">
            <span className="text-[11px] font-medium text-[#858B98]">
              Seq2Seq Beam 4 • BLEU 29.35
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleSpeak}
                disabled={!translatedText}
                className="p-1.5 rounded-lg hover:bg-[#F0F2F6] text-[#858B98] hover:text-[#202124] disabled:opacity-30 transition-colors"
                title="Listen Audio"
              >
                <Volume2 className={`w-4 h-4 ${speaking ? 'text-[#009DDC] animate-pulse' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!translatedText}
                className="p-1.5 rounded-lg hover:bg-[#F0F2F6] text-[#858B98] hover:text-[#202124] disabled:opacity-30 transition-colors"
                title="Copy Translation"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSaveTranslation && onSaveTranslation()}
                disabled={!translatedText}
                className={`p-1.5 rounded-lg hover:bg-[#F0F2F6] disabled:opacity-30 transition-colors ${
                  isSaved ? 'text-[#FDB827]' : 'text-[#858B98] hover:text-[#FDB827]'
                }`}
                title={isSaved ? 'Saved in Starred' : 'Save Translation'}
              >
                <Star className={`w-4 h-4 ${isSaved ? 'fill-[#FDB827]' : ''}`} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* EXPANDABLE NLP PIPELINE DETAILS (22RI52 Lab Diagnostics) */}
      {translatedText && (
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] soft-shadow overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowNlpDetails((prev) => !prev)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold text-[#202124] hover:bg-[#F7F8FA] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#963D97]" />
              <span>NLP Pipeline Details (22RI52 Lab Preprocessing & Typo Diagnostics)</span>
            </div>
            <div className="flex items-center space-x-2 text-[#858B98]">
              <span>{showNlpDetails ? 'Hide Details' : 'View Breakdown'}</span>
              {showNlpDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {showNlpDetails && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F0F2F6] space-y-3.5 text-xs">
              
              {/* Tokens row */}
              <div>
                <p className="font-semibold text-[#858B98] uppercase text-[10px] tracking-wider mb-1">
                  1. Tokenization & Normalization (Exp 1)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(nlpDiagnostics?.tokens || sourceText.split(/\s+/)).map((tok, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-[#F0F2F6] rounded-md font-mono text-[11px] text-[#202124] border border-[#E5E7EB]"
                    >
                      {tok}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-[#61BB46]/10 text-[#30701F] rounded-md font-medium text-[11px]">
                    ✓ Unicode NFC
                  </span>
                </div>
              </div>

              {/* MED Typo Corrections */}
              {nlpDiagnostics?.corrections && nlpDiagnostics.corrections.length > 0 && (
                <div>
                  <p className="font-semibold text-[#858B98] uppercase text-[10px] tracking-wider mb-1">
                    2. Levenshtein MED Typo Corrections (Exp 3)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {nlpDiagnostics.corrections.map((corr, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#FDB827]/15 text-[#9E6E00] rounded-lg font-mono text-[11px] border border-[#FDB827]/30"
                      >
                        <span className="line-through opacity-70">{corr.original}</span> &rarr; <strong>{corr.corrected}</strong> (dist: {corr.distance})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched N-Grams */}
              {nlpDiagnostics?.matched_ngrams && nlpDiagnostics.matched_ngrams.length > 0 && (
                <div>
                  <p className="font-semibold text-[#858B98] uppercase text-[10px] tracking-wider mb-1">
                    3. Greedy Longest-Match N-Grams (Exp 2)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {nlpDiagnostics.matched_ngrams.map((ngram, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#009DDC]/10 text-[#009DDC] rounded-lg text-[11px] border border-[#009DDC]/20"
                      >
                        "{ngram.phrase}" &rarr; <strong>{ngram.translation}</strong> ({ngram.n}-gram)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stemmed forms & SVO/SOV status */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#858B98]">
                {nlpDiagnostics?.reordered_sov && (
                  <span className="inline-flex items-center space-x-1 text-[#61BB46] font-semibold bg-[#61BB46]/10 px-2 py-0.5 rounded-full border border-[#61BB46]/20">
                    ✓ SVO &rarr; SOV Indic Syntax Transformation Applied
                  </span>
                )}
                <span className="inline-flex items-center space-x-1 font-mono">
                  Engine: {translationEngine || 'Offline Pure-NLP Engine'}
                </span>
              </div>

            </div>
          )}
        </div>
      )}

      {/* BELOW CARDS: PRIMARY ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Apple-Inspired Multi-Band Gradient Button */}
          <button
            type="button"
            onClick={() => onTranslate()}
            disabled={isLoading || isComparing || !sourceText.trim()}
            className="apple-gradient-btn px-7 py-3 rounded-[16px] text-white font-semibold text-sm flex items-center space-x-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 text-white" />
                <span>Translate Now</span>
              </>
            )}
          </button>

          {/* Secondary Actions */}
          <button
            type="button"
            onClick={onCompare}
            disabled={isComparing || !sourceText.trim()}
            className="px-4 py-3 rounded-[16px] text-xs font-semibold bg-white border border-[#E5E7EB] hover:bg-[#F0F2F6] text-[#202124] soft-shadow transition-colors disabled:opacity-40"
          >
            {isComparing ? 'Comparing...' : 'Compare Models'}
          </button>

          <button
            type="button"
            onClick={() => onSwitchTab('settings')}
            className="px-4 py-3 rounded-[16px] text-xs font-semibold bg-white border border-[#E5E7EB] hover:bg-[#F0F2F6] text-[#202124] soft-shadow transition-colors"
          >
            NLP Inspect
          </button>

          <button
            type="button"
            onClick={onClear}
            className="px-4 py-3 rounded-[16px] text-xs font-semibold bg-white border border-[#E5E7EB] hover:bg-[#F0F2F6] text-[#858B98] hover:text-[#202124] soft-shadow transition-colors"
          >
            Clear Text
          </button>
        </div>

        {/* Latency & Engine Health Status */}
        <div className="text-right">
          <span className="text-xs font-mono font-medium text-[#61BB46] bg-[#61BB46]/10 px-3 py-1.5 rounded-full border border-[#61BB46]/20 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#61BB46]"></span>
            <span>
              {isConnected
                ? latency
                  ? `Engine Active (${latency.toFixed(0)}ms)`
                  : 'Fast Engine Ready'
                : '100% Pure-NLP Offline Ready'}
            </span>
          </span>
        </div>
      </div>

      {/* FOOTER TIP STRIP */}
      <div className="p-3.5 bg-white border border-[#EBECEF] rounded-[16px] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#858B98] soft-shadow gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#61BB46] shrink-0"></span>
          <span className="font-medium text-[#202124]">
            22RI52 Pure-NLP Engine (0 MB Download Required)
          </span>
        </div>
        <p className="text-[11px] text-[#858B98]">
          Tip: Press the circular swap button to invert languages. Typo snapping & N-gram matching run 100% locally.
        </p>
      </div>

    </div>
  );
}
