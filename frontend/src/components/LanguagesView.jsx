/**
 * LinguaBridge AI - Languages Directory View
 * ===========================================
 * Module: frontend/src/components/LanguagesView.jsx
 * 
 * Features:
 * - Search bar with real-time filtering
 * - Recently used languages quick pills
 * - 3-column card grid for Kannada, Hindi, Tamil, Telugu, English, and international languages
 * - Greeting samples and direct selection into the translator workspace
 */

import React, { useState } from 'react';
import { Search, ArrowRight, Check, Sparkles } from 'lucide-react';

const LANGUAGE_CATALOG = [
  {
    code: 'kan_Knda',
    iso: 'kn',
    name: 'Kannada',
    native: 'ಕನ್ನಡ',
    fontClass: 'font-kannada',
    accentColor: '#FDB827',
    badgeBg: 'bg-[#FDB827]/15',
    badgeText: 'text-[#9E6E00]',
    borderHover: 'hover:border-[#FDB827]',
    sampleText: 'ನಮಸ್ಕಾರ (Namaskara)',
    fullSample: 'ಗ್ರಾಮೀಣ ಶಾಲೆಗಳಿಗಾಗಿ ಸರ್ಕಾರವು ಹೊಸ ಶೈಕ್ಷಣಿಕ ನೀತಿಗಳನ್ನು ಪ್ರಕಟಿಸಿತು.',
    description: 'Dravidian script of Karnataka with rich akshara conjunct forms and full NLLB/LoRA support.',
  },
  {
    code: 'hin_Deva',
    iso: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    fontClass: 'font-devanagari',
    accentColor: '#E03A3E',
    badgeBg: 'bg-[#E03A3E]/10',
    badgeText: 'text-[#E03A3E]',
    borderHover: 'hover:border-[#E03A3E]',
    sampleText: 'नमस्ते (Namaste)',
    fullSample: 'सरकार ने ग्रामीण स्कूलों के लिए नई शैक्षिक नीतियों की घोषणा की।',
    description: 'Devanagari script, widely spoken across India with complete seq2seq translation support.',
  },
  {
    code: 'tam_Taml',
    iso: 'ta',
    name: 'Tamil',
    native: 'தமிழ்',
    fontClass: 'font-tamil',
    accentColor: '#963D97',
    badgeBg: 'bg-[#963D97]/10',
    badgeText: 'text-[#963D97]',
    borderHover: 'hover:border-[#963D97]',
    sampleText: 'வணக்கம் (Vanakkam)',
    fullSample: 'கிராமப்புற பள்ளிகளுக்கான புதிய கல்விக் கொள்கைகளை அரசு அறிவித்தது.',
    description: 'Classical Dravidian language of Tamil Nadu with pulli/virama diacritics and NLLB-200 support.',
  },
  {
    code: 'tel_Telu',
    iso: 'te',
    name: 'Telugu',
    native: 'తెలుగు',
    fontClass: 'font-telugu',
    accentColor: '#009DDC',
    badgeBg: 'bg-[#009DDC]/10',
    badgeText: 'text-[#009DDC]',
    borderHover: 'hover:border-[#009DDC]',
    sampleText: 'నమస్కారం (Namaskaram)',
    fullSample: 'గ్రామీణ పాఠశాలల కోసం ప్రభుత్వం కొత్త విద్యా విధానాలను ప్రకటించింది.',
    description: 'Telugu script with distinctive rounded vowels and consonants, fully supported.',
  },
  {
    code: 'eng_Latn',
    iso: 'en',
    name: 'English',
    native: 'English',
    fontClass: 'font-sans',
    accentColor: '#61BB46',
    badgeBg: 'bg-[#61BB46]/10',
    badgeText: 'text-[#30701F]',
    borderHover: 'hover:border-[#61BB46]',
    sampleText: 'Hello / Good Morning',
    fullSample: 'The government announced new educational policies for rural schools.',
    description: 'Global bridge language with standard Latin script and full bidirectional conversion.',
  },
  {
    code: 'spa_Latn',
    iso: 'es',
    name: 'Spanish',
    native: 'Español',
    fontClass: 'font-sans',
    accentColor: '#858B98',
    badgeBg: 'bg-[#F0F2F6]',
    badgeText: 'text-[#858B98]',
    borderHover: 'hover:border-[#858B98]',
    sampleText: 'Hola (Hello)',
    fullSample: 'El gobierno anunció nuevas políticas educativas para las escuelas rurales.',
    description: 'Romance language family; supported by base NLLB-200 multilingual model.',
  },
];

export default function LanguagesView({
  onSelectLanguage,
  onApplySample,
  currentSource,
  currentTarget,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = LANGUAGE_CATALOG.filter((lang) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.native.toLowerCase().includes(q) ||
      lang.iso.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202124]">
          Explore languages.
        </h2>
        <p className="text-sm text-[#858B98] mt-1">
          Switch seamlessly across English and Indian scripts with neural and offline support.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search languages or script (e.g., Kannada, Hindi, Tamil, Telugu)..."
          className="w-full bg-white border border-[#E5E7EB] rounded-[18px] px-5 py-3.5 pl-11 text-sm text-[#202124] outline-none focus:ring-2 focus:ring-[#E03A3E]/20 soft-shadow transition-all"
        />
        <Search className="w-4 h-4 text-[#858B98] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Recently Used Row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#858B98] mb-3">
          Recently Used
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onSelectLanguage('eng_Latn', 'source')}
            className="px-4 py-2.5 bg-white border border-[#E5E7EB] hover:border-[#61BB46] rounded-[14px] flex items-center space-x-2 text-xs font-semibold text-[#202124] soft-shadow transition-all"
          >
            <span>🇬🇧 English</span>
            <span className="text-[10px] text-[#858B98] font-mono bg-[#F0F2F6] px-1.5 py-0.5 rounded">
              en
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectLanguage('kan_Knda', 'target')}
            className="px-4 py-2.5 bg-white border border-[#FDB827]/60 hover:border-[#FDB827] rounded-[14px] flex items-center space-x-2 text-xs font-semibold text-[#202124] soft-shadow transition-all"
          >
            <span>🇮🇳 Kannada (ಕನ್ನಡ)</span>
            <span className="text-[10px] text-[#9E6E00] font-mono bg-[#FDB827]/15 px-1.5 py-0.5 rounded">
              kn
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectLanguage('hin_Deva', 'target')}
            className="px-4 py-2.5 bg-white border border-[#E5E7EB] hover:border-[#E03A3E] rounded-[14px] flex items-center space-x-2 text-xs font-semibold text-[#202124] soft-shadow transition-all"
          >
            <span>🇮🇳 Hindi (हिन्दी)</span>
            <span className="text-[10px] text-[#858B98] font-mono bg-[#F0F2F6] px-1.5 py-0.5 rounded">
              hi
            </span>
          </button>
        </div>
      </div>

      {/* 3-Column Language Cards Grid */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#858B98] mb-3">
          Core & Supported Languages ({filteredLanguages.length})
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLanguages.map((lang) => {
            const isCurrentTarget = currentTarget === lang.code;
            const isCurrentSource = currentSource === lang.code;

            return (
              <div
                key={lang.code}
                className={`p-5 bg-white border border-[#E5E7EB] ${lang.borderHover} rounded-[20px] soft-shadow transition-all group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-base text-[#202124] flex items-center gap-1.5">
                        {lang.name}
                        {isCurrentTarget && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active Target
                          </span>
                        )}
                        {isCurrentSource && (
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            Active Source
                          </span>
                        )}
                      </h3>
                      <p className={`text-xs ${lang.fontClass} font-semibold`} style={{ color: lang.accentColor }}>
                        {lang.native}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold ${lang.badgeBg} ${lang.badgeText} px-2 py-0.5 rounded-full`}
                    >
                      {lang.code}
                    </span>
                  </div>

                  <p className="text-xs text-[#858B98] mb-2 leading-relaxed">
                    {lang.description}
                  </p>

                  <div className="mb-3">
                    <p className="text-[11px] text-[#858B98] mb-1 font-medium">Greeting sample:</p>
                    <div
                      className={`p-3 bg-[#F7F8FA] rounded-[14px] text-sm ${lang.fontClass} font-bold text-[#202124] border border-[#E5E7EB]/50`}
                    >
                      {lang.sampleText}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#F0F2F6] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectLanguage(lang.code, 'target')}
                    className="flex-1 py-1.5 px-2.5 rounded-[10px] text-xs font-semibold bg-[#F0F2F6] hover:bg-[#E5E7EB] text-[#202124] transition-colors text-center"
                  >
                    Set as Target
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onApplySample) {
                        onApplySample(lang.fullSample, lang.code === 'eng_Latn' ? 'eng_Latn' : 'eng_Latn', lang.code);
                      }
                    }}
                    className="py-1.5 px-2.5 rounded-[10px] text-xs font-semibold text-[#858B98] hover:text-[#202124] hover:bg-[#F0F2F6] transition-colors"
                    title="Insert full sample into translator"
                  >
                    Sample
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
