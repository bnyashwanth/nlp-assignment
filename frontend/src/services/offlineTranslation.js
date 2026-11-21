/**
 * LinguaBridge AI - Offline ML Kit Translation Service
 * ====================================================
 * Module: frontend/src/services/offlineTranslation.js
 * 
 * Provides on-device neural translation using @capacitor-mlkit/translation.
 * Supports English, Kannada, and Hindi offline translation on Android & iOS.
 * 
 * Features:
 * - Language code mapping (NLLB eng_Latn / kan_Knda / hin_Deva <-> ML Kit en / kn / hi)
 * - Model download management: Translation.downloadModel({ language })
 * - Model deletion management: Translation.deleteDownloadedModel({ language })
 * - Model inventory querying: Translation.getDownloadedModels()
 * - On-device translation: Translation.translate({ text, sourceLanguage, targetLanguage })
 * - Local offline phrase and token fallback when model pack is loading or on web
 */

import { Capacitor } from '@capacitor/core';
import { Translation, Language } from '@capacitor-mlkit/translation';
import { translateLocally } from './localOfflineFallback';

export { Language };

/**
 * Checks whether offline ML Kit translation is supported in the current environment.
 * @returns {boolean} True if running inside a native Android or iOS Capacitor container.
 */
export function isOfflineTranslationSupported() {
  try {
    return (
      typeof Capacitor !== 'undefined' &&
      Capacitor.isNativePlatform() &&
      Capacitor.isPluginAvailable('Translation')
    );
  } catch (e) {
    return false;
  }
}

/**
 * Maps incoming language codes to ML Kit Language enum ('en', 'kn', 'hi').
 * 
 * @param {string} code - Language code, e.g. 'eng_Latn', 'kan_Knda', 'hin_Deva', 'en', 'kn', 'hi'
 * @returns {string} ML Kit Language string
 */
export function mapCodeToMlKitLanguage(code) {
  if (!code) return Language.English;
  const normalized = String(code).toLowerCase().trim();

  // Match Hindi
  if (normalized.startsWith('hin') || normalized === 'hi' || normalized.includes('deva')) {
    return Language.Hindi; // 'hi'
  }

  // Match Kannada
  if (normalized.startsWith('kan') || normalized === 'kn' || normalized.includes('knda')) {
    return Language.Kannada; // 'kn'
  }

  // Match English
  if (normalized.startsWith('eng') || normalized === 'en' || normalized.includes('latn')) {
    return Language.English; // 'en'
  }

  // Direct enum value check
  if (Object.values(Language).includes(code)) {
    return code;
  }

  return Language.English;
}

/**
 * Human-readable label for ML Kit languages.
 */
export function getLanguageLabel(language) {
  const norm = String(language).toLowerCase();
  if (norm === Language.Hindi || norm === 'hi' || norm.includes('hin')) {
    return 'Hindi';
  }
  if (norm === Language.Kannada || norm === 'kn' || norm.includes('kan')) {
    return 'Kannada';
  }
  if (norm === Language.English || norm === 'en' || norm.includes('eng')) {
    return 'English';
  }
  return String(language);
}

/**
 * Queries the list of downloaded language models currently present on the native device.
 * 
 * @returns {Promise<{ languages: string[], isSupported: boolean }>}
 */
export async function getDownloadedModels() {
  if (!isOfflineTranslationSupported()) {
    return { languages: [], isSupported: false };
  }

  try {
    const result = await Translation.getDownloadedModels();
    return {
      languages: result.languages || [],
      isSupported: true,
    };
  } catch (err) {
    console.error('[OfflineTranslation] Error getting downloaded models:', err);
    throw new Error(
      `Failed to check downloaded models: ${err.message || 'Unknown plugin error'}`
    );
  }
}

/**
 * Downloads a language model pack (~30MB) onto the device storage.
 * 
 * @param {Object} options
 * @param {string} options.language - ML Kit Language (Language.English, Language.Kannada, Language.Hindi)
 * @returns {Promise<void>}
 */
export async function downloadModel({ language }) {
  if (!isOfflineTranslationSupported()) {
    throw new Error(
      'Offline model packs can only be downloaded on native Android and iOS devices. ' +
      'In web browsers, LinguaBridge AI connects directly to the FastAPI NLLB cloud backend.'
    );
  }

  const mlKitLang = mapCodeToMlKitLanguage(language);
  const langLabel = getLanguageLabel(mlKitLang);
  let timeoutId;

  try {
    console.info(`[OfflineTranslation] Initiating download for ${langLabel} (${mlKitLang})...`);
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Download timed out after 30 seconds for ${langLabel}. Connect to Wi-Fi and retry.`));
      }, 30000);
    });

    await Promise.race([
      Translation.downloadModel({ language: mlKitLang }),
      timeoutPromise,
    ]);
    console.info(`[OfflineTranslation] Successfully downloaded ${langLabel} model pack.`);
  } catch (err) {
    console.error(`[OfflineTranslation] Download failed for ${langLabel}:`, err);
    throw new Error(
      `Failed to download ${langLabel} language model: ${err.message || 'Check your internet connection and try again.'}`
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Deletes a downloaded language model pack from device storage.
 * 
 * @param {Object} options
 * @param {string} options.language - ML Kit Language
 * @returns {Promise<void>}
 */
export async function deleteDownloadedModel({ language }) {
  if (!isOfflineTranslationSupported()) {
    throw new Error('Offline models can only be deleted on native Android and iOS devices.');
  }

  const mlKitLang = mapCodeToMlKitLanguage(language);
  const langLabel = getLanguageLabel(mlKitLang);

  try {
    console.info(`[OfflineTranslation] Deleting model pack for ${langLabel} (${mlKitLang})...`);
    await Translation.deleteDownloadedModel({ language: mlKitLang });
    console.info(`[OfflineTranslation] Successfully deleted ${langLabel} model pack.`);
  } catch (err) {
    console.error(`[OfflineTranslation] Deletion failed for ${langLabel}:`, err);
    throw new Error(
      `Failed to delete ${langLabel} language model: ${err.message || 'Unknown error'}`
    );
  }
}

/**
 * Executes on-device translation using the local ML Kit neural model or bundled local fallback.
 * 
 * @param {Object} params
 * @param {string} params.text - Source text to translate
 * @param {string} params.sourceLang - Source language code
 * @param {string} params.targetLang - Target language code
 * @returns {Promise<Object>} Formatted translation result with latency and mode
 */
export async function translateOffline({ text, sourceLang, targetLang }) {
  const trimmedText = (text || '').trim();
  if (!trimmedText) {
    return {
      source_text: '',
      translated_text: '',
      source_lang: sourceLang,
      target_lang: targetLang,
      latency_ms: 0,
      mode: 'offline',
      engine: 'Offline On-Device Model',
    };
  }

  const sourceLanguage = mapCodeToMlKitLanguage(sourceLang);
  const targetLanguage = mapCodeToMlKitLanguage(targetLang);
  const srcLabel = getLanguageLabel(sourceLanguage);
  const tgtLabel = getLanguageLabel(targetLanguage);

  // 1. If running on native Capacitor Android/iOS, try ML Kit
  if (isOfflineTranslationSupported()) {
    let downloadedModels = [];
    try {
      const checkResult = await Translation.getDownloadedModels();
      downloadedModels = checkResult.languages || [];
    } catch (err) {
      console.warn('[OfflineTranslation] Could not query downloaded models:', err);
    }

    const hasSource = downloadedModels.includes(sourceLanguage);
    const hasTarget = downloadedModels.includes(targetLanguage);

    if (hasSource && hasTarget) {
      try {
        const startTime = performance.now();
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error('ML Kit translation timed out after 8 seconds')),
            8000
          );
        });

        let result;
        try {
          result = await Promise.race([
            Translation.translate({
              text: trimmedText,
              sourceLanguage,
              targetLanguage,
            }),
            timeoutPromise,
          ]);
        } finally {
          clearTimeout(timeoutId);
        }

        return {
          source_text: trimmedText,
          translated_text: result.text,
          source_lang: sourceLang,
          target_lang: targetLang,
          model_variant: 'mlkit_offline',
          latency_ms: Math.round(performance.now() - startTime),
          mode: 'offline',
          engine: 'ML Kit On-Device Model',
          isLocalFallback: false,
        };
      } catch (err) {
        console.warn('[OfflineTranslation] ML Kit translation error; switching to bundled fallback:', err);
      }
    } else {
      const missing = [];
      if (!hasSource) missing.push(srcLabel);
      if (!hasTarget) missing.push(tgtLabel);
      console.info(`[OfflineTranslation] Missing ML Kit packs: ${missing.join(', ')}. Using local dictionary.`);
    }
  }

  // 2. Bundled local dictionary fallback: runs on device with zero network calls
  const startTime = performance.now();
  const local = translateLocally(trimmedText, sourceLang, targetLang);
  return {
    source_text: trimmedText,
    translated_text: local.translatedText,
    source_lang: sourceLang,
    target_lang: targetLang,
    model_variant: 'local_dictionary',
    latency_ms: Math.round(performance.now() - startTime),
    mode: 'offline',
    engine: 'Local Offline Model (On-Device)',
    isLocalFallback: true,
  };
}
