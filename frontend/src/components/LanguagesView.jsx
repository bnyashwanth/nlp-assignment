/**
 * LinguaBridge AI - Languages Directory View (3-Color System)
 * ============================================================
 * Module: frontend/src/components/LanguagesView.jsx
 * 
 * Strict 3-Color System:
 * - Surface: Crisp White (#FFFFFF) & Soft Off-White (#F5F5F7), Border (#E5E5EA)
 * - Primary Ink: Deep Charcoal (#1D1D1F), Secondary: Muted Gray (#6E6E73)
 * - Single Accent: Deep Teal (#0F766E)
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
    sampleText: 'ನಮಸ್ಕಾರ (Namaskara)',
    fullSample: 'ಗ್ರಾಮೀಣ ಶಾಲೆಗಳಿಗಾಗಿ ಸರ್ಕಾರವು ಹೊಸ ಶೈಕ್ಷಣಿಕ ನೀತಿಗಳನ್ನು ಪ್ರಕಟಿಸಿತು.',
    description: 'Dravidian script of Karnataka with rich akshara conjunct forms and full 22RI52 pure-NLP support.',
  },
  {
    code: 'hin_Deva',
    iso: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    fontClass: 'font-devanagari',
    sampleText: 'नमस्ते (Namaste)',
    fullSample: 'सरकार ने ग्रामीण स्कूलों के लिए नई शैक्षिक नीतियों की घोषणा की।',
    description: 'Devanagari script, widely spoken across India with complete symbolic and seq2seq translation support.',
  },
  {
    code: 'tam_Taml',
    iso: 'ta',
    name: 'Tamil',
    native: 'தமிழ்',
    fontClass: 'font-tamil',
    sampleText: 'வணக்கம் (Vanakkam)',
    fullSample: 'கிராமப்புற பள்ளிகளுக்கான புதிய கல்விக் கொள்கைகளை அரசு அறிவித்தது.',
    description: 'Classical Dravidian language of Tamil Nadu with pulli/virama diacritics and parallel corpus.',
  },
  {
    code: 'tel_Telu',
    iso: 'te',
    name: 'Telugu',
    native: 'తెలుగు',
    fontClass: 'font-telugu',
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
    sampleText: 'Hola (Hello)',
    fullSample: 'El gobierno anunció nuevas políticas educativas para las escuelas rurales.',
    description: 'Romance language family; supported by multilingual lexicon and base model.',
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
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
          Explore languages.
        </h2>
        <p className="text-sm text-[#6E6E73] mt-1">
          Switch seamlessly across English and Indian scripts with 22RI52 pure-NLP support.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search languages or script (e.g., Kannada, Hindi, Tamil, Telugu)..."
          className="w-full bg-white border border-[#E5E5EA] rounded-[16px] px-5 py-3.5 pl-11 text-sm text-[#1D1D1F] outline-none focus:ring-2 focus:ring-[#0F766E]/20 soft-shadow transition-all"
        />
        <Search className="w-4 h-4 text-[#6E6E73] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Recently Used Row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] mb-3">
          Recently Used
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onSelectLanguage('eng_Latn', 'source')}
            className="px-4 py-2 bg-white border border-[#E5E5EA] hover:border-[#0F766E] rounded-[12px] flex items-center space-x-2 text-xs font-semibold text-[#1D1D1F] soft-shadow transition-all"
          >
            <span>English</span>
            <span className="text-[10px] text-[#6E6E73] font-mono bg-[#F5F5F7] px-1.5 py-0.5 rounded">
              en
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectLanguage('kan_Knda', 'target')}
            className="px-4 py-2 bg-white border border-[#E5E5EA] hover:border-[#0F766E] rounded-[12px] flex items-center space-x-2 text-xs font-semibold text-[#1D1D1F] soft-shadow transition-all"
          >
            <span>Kannada (ಕನ್ನಡ)</span>
            <span className="text-[10px] text-[#0F766E] font-mono bg-[#F0FDFA] px-1.5 py-0.5 rounded border border-[#0F766E]/20">
              kn
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectLanguage('hin_Deva', 'target')}
            className="px-4 py-2 bg-white border border-[#E5E5EA] hover:border-[#0F766E] rounded-[12px] flex items-center space-x-2 text-xs font-semibold text-[#1D1D1F] soft-shadow transition-all"
          >
            <span>Hindi (हिन्दी)</span>
            <span className="text-[10px] text-[#6E6E73] font-mono bg-[#F5F5F7] px-1.5 py-0.5 rounded">
              hi
            </span>
          </button>
        </div>
      </div>

      {/* 3-Column Language Cards Grid */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] mb-3">
          Supported Languages ({filteredLanguages.length})
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLanguages.map((lang) => {
            const isCurrentTarget = currentTarget === lang.code;
            const isCurrentSource = currentSource === lang.code;

            return (
              <div
                key={lang.code}
                className="p-5 bg-white border border-[#E5E5EA] hover:border-[#0F766E] rounded-[18px] soft-shadow transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-1.5">
                        {lang.name}
                        {isCurrentTarget && (
                          <span className="text-[10px] font-semibold text-[#0F766E] bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#0F766E]/20">
                            Target
                          </span>
                        )}
                        {isCurrentSource && (
                          <span className="text-[10px] font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-2 py-0.5 rounded-full border border-[#E5E5EA]">
                            Source
                          </span>
                        )}
                      </h3>
                      <p className={`text-xs ${lang.fontClass} font-semibold text-[#0F766E]`}>
                        {lang.native}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-semibold bg-[#F5F5F7] text-[#6E6E73] px-2 py-0.5 rounded-full border border-[#E5E5EA]">
                      {lang.code}
                    </span>
                  </div>

                  <p className="text-xs text-[#6E6E73] mb-2 leading-relaxed">
                    {lang.description}
                  </p>

                  <div className="mb-3">
                    <p className="text-[11px] text-[#6E6E73] mb-1 font-medium">Greeting sample:</p>
                    <div
                      className={`p-3 bg-[#F5F5F7] rounded-[12px] text-sm ${lang.fontClass} font-bold text-[#1D1D1F] border border-[#E5E5EA]/60`}
                    >
                      {lang.sampleText}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#F5F5F7] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectLanguage(lang.code, 'target')}
                    className="flex-1 py-1.5 px-2.5 rounded-[10px] text-xs font-semibold bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] transition-colors text-center"
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
                    className="py-1.5 px-2.5 rounded-[10px] text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
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
