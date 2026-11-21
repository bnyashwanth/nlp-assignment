/**
 * Setu - Pure-NLP Offline Translation Service
 * =======================================================
 * Module: frontend/src/services/offlineTranslation.js
 * 
 * 100% Self-Contained Offline Translation Service (0 MB Download Required):
 * - Uses the bundled lexical and NLP fallback engine
 * - Unicode NFC Normalization, Multilingual Tokenization & English Stemming (Exp 1)
 * - Dynamic Programming Minimum Edit Distance Typo Correction (Exp 3)
 * - Greedy N-Gram Longest-Match Phrase Lookup (Exp 2)
 * - SVO -> SOV Sentence Structure Transformation for Indic languages
 * - Zero network dependencies; works out-of-the-box on web and Android APK.
 */

import { translateOfflineNLP } from '../nlp/offlineNlpEngine';

/**
 * Checks whether offline translation is supported.
 * Always true because the Pure-NLP engine is embedded in the application bundle.
 * @returns {boolean}
 */
export function isOfflineTranslationSupported() {
  return true;
}

/**
 * Supported offline languages catalog (0 MB download required)
 */
export const SUPPORTED_OFFLINE_LANGUAGES = [
  { code: 'eng_Latn', iso: 'en', name: 'English', native: 'English', script: 'Latin', status: 'Ready (Embedded)' },
  { code: 'kan_Knda', iso: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada', status: 'Ready (Embedded)' },
  { code: 'hin_Deva', iso: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'Devanagari', status: 'Ready (Embedded)' },
  { code: 'tam_Taml', iso: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'Tamil', status: 'Ready (Embedded)' },
  { code: 'tel_Telu', iso: 'te', name: 'Telugu', native: 'తెలుగు', script: 'Telugu', status: 'Ready (Embedded)' },
];

/**
 * Returns available offline model packs (all built-in and embedded).
 */
export async function getDownloadedOfflineModels() {
  return SUPPORTED_OFFLINE_LANGUAGES.map((l) => l.iso);
}

/**
 * Translates text on-device using the pure-NLP offline engine.
 * 
 * @param {Object} params
 * @param {string} params.text - Input source text
 * @param {string} params.sourceLang - Source language code
 * @param {string} params.targetLang - Target language code
 * @returns {Promise<Object>} Formatted translation payload
 */
export async function translateOffline({ text, sourceLang, targetLang }) {
  const result = await translateOfflineNLP({
    text,
    source_lang: sourceLang,
    target_lang: targetLang,
  });

  return {
    translated_text: result.translated_text,
    source_lang: sourceLang,
    target_lang: targetLang,
    mode: 'offline',
    engine: result.engine || 'Offline Pure-NLP Engine',
    isOffline: true,
    latency_ms: result.latency_ms || 3,
    model_variant: 'pure_nlp_offline',
    diagnostics: result.diagnostics,
  };
}
