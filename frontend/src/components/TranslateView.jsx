/**
 * LinguaBridge AI - Translate Workspace View (3-Color Pure-NLP)
 * ==============================================================
 * Module: frontend/src/components/TranslateView.jsx
 * 
 * Strict 3-Color System:
 * - Surface: Crisp White (#FFFFFF) & Soft Off-White (#F5F5F7), Border (#E5E5EA)
 * - Primary Ink: Deep Charcoal (#1D1D1F), Secondary: Muted Gray (#6E6E73)
 * - Single Accent: Deep Teal (#0F766E)
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
  onTranslate,
  onClear,
  isLoading,
  latency,
  translationMode,
  translationEngine,
  nlpDiagnostics,
  isConnected,
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

  // Minimal 3-color mode badge
  const renderModeBadge = () => {
    const eng = (translationEngine || '').toLowerCase();
    const isCache = eng.includes('cache');
    const isPureNLP = eng.includes('pure-nlp') || eng.includes('offline');

    if (isCache) {
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6E6E73]"></span>
          <span>Offline NLP Cache</span>
          {latency ? <span className="font-mono text-[10px] text-[#6E6E73]">&bull; {latency}ms</span> : null}
        </span>
      );
    }

    if (isPureNLP || !isConnected) {
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
          <span>22RI52 Pure-NLP</span>
          {latency ? <span className="font-mono text-[10px]">&bull; {latency}ms</span> : null}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse"></span>
        <span>Online Python NLLB</span>
        {latency ? <span className="font-mono text-[10px]">&bull; {latency}ms</span> : null}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
          Translate with clarity.
        </h2>
        <p className="text-sm text-[#6E6E73] mt-1">
          English, Kannada, Hindi, Tamil, and Telugu 22RI52 pure-NLP offline translation.
        </p>
      </div>

      {/* Mode & Target Bar (Model variant tabs cleanly removed) */}
      <div className="flex items-center justify-between p-2.5 bg-white border border-[#E5E5EA] rounded-[16px] soft-shadow flex-wrap gap-2.5">
        
        {/* Left: Engine Identity Badge */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-[10px] bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]">
            22RI52 Pure-NLP Engine
          </span>
          <span className="text-[11px] text-[#6E6E73] hidden sm:inline">
            SVO &rarr; SOV &bull; Levenshtein MED &bull; N-Grams
          </span>
        </div>

        {/* Right: Quick Target Language Pills & Offline Status */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
          <span className="text-xs text-[#6E6E73] font-medium mr-1 hidden sm:inline">Target:</span>
          
          <button
            type="button"
            onClick={() => onChangeTarget('kan_Knda')}
            className={`px-2.5 py-1 rounded-[8px] text-xs transition-all ${
              targetLang === 'kan_Knda'
                ? 'font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/30 shadow-xs'
                : 'font-medium bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] border border-[#E5E5EA]'
            }`}
          >
            ಕನ್ನಡ kn
          </button>

          <button
            type="button"
            onClick={() => onChangeTarget('hin_Deva')}
            className={`px-2.5 py-1 rounded-[8px] text-xs transition-all ${
              targetLang === 'hin_Deva'
                ? 'font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/30 shadow-xs'
                : 'font-medium bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] border border-[#E5E5EA]'
            }`}
          >
            हिन्दी hi
          </button>

          <button
            type="button"
            onClick={() => onChangeTarget('tam_Taml')}
            className={`px-2.5 py-1 rounded-[8px] text-xs transition-all ${
              targetLang === 'tam_Taml'
                ? 'font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/30 shadow-xs'
                : 'font-medium bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] border border-[#E5E5EA]'
            }`}
          >
            தமிழ் ta
          </button>

          <button
            type="button"
            onClick={() => onChangeTarget('tel_Telu')}
            className={`px-2.5 py-1 rounded-[8px] text-xs transition-all ${
              targetLang === 'tel_Telu'
                ? 'font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/30 shadow-xs'
                : 'font-medium bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] border border-[#E5E5EA]'
            }`}
          >
            తెలుగు te
          </button>

          <div className="h-4 w-[1px] bg-[#E5E5EA] mx-1"></div>

          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[8px] text-xs font-semibold bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
            <span>Pure-NLP Ready</span>
          </span>
        </div>
      </div>

      {/* TRANSLATION PANELS (Two Clean White Cards + Floating Center Swap) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative items-stretch">
        
        {/* LEFT CARD (Source) */}
        <div className="bg-white rounded-[20px] border border-[#E5E5EA] p-5 sm:p-6 soft-shadow flex flex-col justify-between min-h-[360px]">
          <div>
            {/* Header: Dropdown & Preprocessing Badge */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F5F5F7] gap-2 flex-wrap">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6E6E73]">
                  Source
                </span>
                <div className="relative">
                  <select
                    value={sourceLang}
                    onChange={(e) => onChangeSource(e.target.value)}
                    className="appearance-none bg-[#F5F5F7] hover:bg-[#E5E5EA] border border-[#E5E5EA] text-[#1D1D1F] text-xs font-semibold rounded-[10px] pl-2.5 pr-7 py-1.5 cursor-pointer outline-none transition-all"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label} ({lang.iso})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6E6E73] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <span className="text-[11px] font-medium text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-0.5 rounded-full border border-[#E5E5EA]">
                NFC Normalized &bull; Tokenized
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
                className="w-full text-base leading-relaxed text-[#1D1D1F] font-normal resize-none outline-none bg-transparent placeholder-[#6E6E73] h-[180px]"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Card Bottom Bar */}
          <div className="pt-3 border-t border-[#F5F5F7] flex items-center justify-between text-xs text-[#6E6E73]">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePickRandomSample}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#E5E5EA] px-2.5 py-1 rounded-[8px] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sample</span>
              </button>
              {sourceText && (
                <button
                  type="button"
                  onClick={onClear}
                  className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
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
            className="w-10 h-10 rounded-full bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md flex items-center justify-center text-[#1D1D1F] hover:border-[#0F766E] transition-all hover:scale-105 active:scale-95 group"
            title="Swap source and target languages"
          >
            <ArrowLeftRight className="w-4 h-4 text-[#6E6E73] group-hover:text-[#0F766E] transition-colors" />
          </button>
        </div>

        {/* RIGHT CARD (Target) */}
        <div className="bg-white rounded-[20px] border border-[#E5E5EA] p-5 sm:p-6 soft-shadow flex flex-col justify-between min-h-[360px]">
          <div>
            {/* Header: Dropdown & Mode Badge */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F5F5F7] gap-2 flex-wrap">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6E6E73]">
                  Target
                </span>
                <div className="relative">
                  <select
                    value={targetLang}
                    onChange={(e) => onChangeTarget(e.target.value)}
                    className="appearance-none bg-[#F5F5F7] hover:bg-[#E5E5EA] border border-[#E5E5EA] text-[#1D1D1F] text-xs font-semibold rounded-[10px] pl-2.5 pr-7 py-1.5 cursor-pointer outline-none transition-all"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.native} ({lang.iso})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6E6E73] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Dynamic 3-Color Mode Badge */}
              {renderModeBadge()}
            </div>

            {/* Output Text Area */}
            <div className="pt-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[180px] text-[#6E6E73] space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1D1D1F]" />
                  <p className="text-xs font-medium">Translating via 22RI52 Pure-NLP Pipeline...</p>
                </div>
              ) : translatedText ? (
                <p
                  className={`${getTargetFontClass()} text-lg leading-relaxed text-[#1D1D1F] font-medium h-[180px] select-text overflow-y-auto`}
                >
                  {translatedText}
                </p>
              ) : (
                <p className="text-base leading-relaxed text-[#6E6E73]/50 italic h-[180px] flex items-center justify-center">
                  Translation will appear here...
                </p>
              )}
            </div>
          </div>

          {/* Card Bottom Bar: Actions */}
          <div className="pt-3 border-t border-[#F5F5F7] flex items-center justify-between text-xs text-[#6E6E73]">
            <span className="text-[11px] font-medium text-[#6E6E73]">
              22RI52 Pure-NLP Pipeline
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleSpeak}
                disabled={!translatedText}
                className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] disabled:opacity-30 transition-colors"
                title="Listen Audio"
              >
                <Volume2 className={`w-4 h-4 ${speaking ? 'text-[#0F766E] animate-pulse' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!translatedText}
                className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] disabled:opacity-30 transition-colors"
                title="Copy Translation"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#0F766E]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSaveTranslation && onSaveTranslation()}
                disabled={!translatedText}
                className={`p-1.5 rounded-lg hover:bg-[#F5F5F7] disabled:opacity-30 transition-colors ${
                  isSaved ? 'text-[#0F766E]' : 'text-[#6E6E73] hover:text-[#0F766E]'
                }`}
                title={isSaved ? 'Saved in Starred' : 'Save Translation'}
              >
                <Star className={`w-4 h-4 ${isSaved ? 'fill-[#0F766E]' : ''}`} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* EXPANDABLE NLP PIPELINE DETAILS (22RI52 Lab Diagnostics) */}
      {translatedText && (
        <div className="bg-white rounded-[16px] border border-[#E5E5EA] soft-shadow overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowNlpDetails((prev) => !prev)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#0F766E]" />
              <span>NLP Pipeline Details (22RI52 Preprocessing, MED & N-Gram Diagnostics)</span>
            </div>
            <div className="flex items-center space-x-2 text-[#6E6E73]">
              <span>{showNlpDetails ? 'Hide' : 'View'}</span>
              {showNlpDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {showNlpDetails && (
            <div className="px-5 pb-5 pt-2 border-t border-[#F5F5F7] space-y-3.5 text-xs">
              
              {/* Tokens row */}
              <div>
                <p className="font-semibold text-[#6E6E73] uppercase text-[10px] tracking-wider mb-1">
                  1. Tokenization & Normalization (Exp 1)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(nlpDiagnostics?.tokens || sourceText.split(/\s+/)).map((tok, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-[#F5F5F7] rounded-md font-mono text-[11px] text-[#1D1D1F] border border-[#E5E5EA]"
                    >
                      {tok}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-[#F0FDFA] text-[#0F766E] rounded-md font-medium text-[11px] border border-[#0F766E]/20">
                    &bull; Unicode NFC Normalized
                  </span>
                </div>
              </div>

              {/* MED Typo Corrections */}
              {nlpDiagnostics?.corrections && nlpDiagnostics.corrections.length > 0 && (
                <div>
                  <p className="font-semibold text-[#6E6E73] uppercase text-[10px] tracking-wider mb-1">
                    2. Levenshtein MED Typo Corrections (Exp 3)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {nlpDiagnostics.corrections.map((corr, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg font-mono text-[11px] border border-[#E5E5EA]"
                      >
                        <span className="line-through text-[#6E6E73]">{corr.original}</span> &rarr; <strong>{corr.corrected}</strong> (dist: {corr.distance})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched N-Grams */}
              {nlpDiagnostics?.matched_ngrams && nlpDiagnostics.matched_ngrams.length > 0 && (
                <div>
                  <p className="font-semibold text-[#6E6E73] uppercase text-[10px] tracking-wider mb-1">
                    3. Greedy Longest-Match N-Grams (Exp 2)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {nlpDiagnostics.matched_ngrams.map((ngram, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#F0FDFA] text-[#0F766E] rounded-lg text-[11px] border border-[#0F766E]/20"
                      >
                        "{ngram.phrase}" &rarr; <strong>{ngram.translation}</strong> ({ngram.n}-gram)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stemmed forms & SVO/SOV status */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#6E6E73]">
                {nlpDiagnostics?.reordered_sov && (
                  <span className="inline-flex items-center space-x-1 text-[#0F766E] font-semibold bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#0F766E]/20">
                    &bull; SVO &rarr; SOV Indic Syntax Transformation Applied
                  </span>
                )}
                <span className="inline-flex items-center space-x-1 font-mono">
                  Engine: {translationEngine || '22RI52 Pure-NLP Pipeline'}
                </span>
              </div>

            </div>
          )}
        </div>
      )}

      {/* BELOW CARDS: PRIMARY ACTIONS BAR (Compare Models cleanly removed) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Solid Charcoal Action Button (Gradient removed) */}
          <button
            type="button"
            onClick={() => onTranslate()}
            disabled={isLoading || !sourceText.trim()}
            className="pure-nlp-btn px-6 py-2.5 rounded-[12px] font-semibold text-xs flex items-center space-x-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
                <span>Translate Now</span>
              </>
            )}
          </button>

          {/* Secondary Actions */}
          <button
            type="button"
            onClick={() => onSwitchTab('settings')}
            className="px-4 py-2.5 rounded-[12px] text-xs font-semibold bg-white border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#1D1D1F] soft-shadow transition-colors"
          >
            NLP Inspect
          </button>

          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2.5 rounded-[12px] text-xs font-semibold bg-white border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] soft-shadow transition-colors"
          >
            Clear Text
          </button>
        </div>

        {/* Latency & Engine Health Status */}
        <div className="text-right">
          <span className="text-xs font-mono font-medium text-[#0F766E] bg-[#F0FDFA] px-3 py-1.5 rounded-full border border-[#0F766E]/20 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
            <span>
              {isConnected
                ? latency
                  ? `Engine Active (${latency}ms)`
                  : 'Fast Engine Ready'
                : 'Pure-NLP Offline Ready'}
            </span>
          </span>
        </div>
      </div>

      {/* FOOTER TIP STRIP */}
      <div className="p-3 bg-white border border-[#E5E5EA] rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6E6E73] soft-shadow gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0"></span>
          <span className="font-medium text-[#1D1D1F]">
            22RI52 Pure-NLP Translation Architecture
          </span>
        </div>
        <p className="text-[11px] text-[#6E6E73]">
          Pure-NLP runs 100% locally with typo tolerance, greedy N-grams, and SVO&rarr;SOV grammar transformation.
        </p>
      </div>

    </div>
  );
}
