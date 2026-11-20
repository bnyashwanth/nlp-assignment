/**
 * LinguaBridge AI - Offline ML Kit Translation Service
 * ====================================================
 * Module: frontend/src/services/offlineTranslation.js
 * 
 * Provides on-device machine translation using @capacitor-mlkit/translation.
 * Runs completely offline on Android and iOS native platforms.
 * 
 * Features:
 * - Language code mapping (NLLB 'eng_Latn'/'kan_Knda' <-> ML Kit Language enum 'en'/'kn')
 * - Model download management: Translation.downloadModel({ language })
 * - Model deletion management: Translation.deleteDownloadedModel({ language })
 * - Model inventory querying: Translation.getDownloadedModels()
 * - On-device translation: Translation.translate({ text, sourceLanguage, targetLanguage })
 * - Defensive error handling: Friendly notifications for missing packs and web fallbacks.
 *   Never crashes and never returns simulated/fake strings.
 */

import { Capacitor } from '@capacitor/core';
import { Translation, Language } from '@capacitor-mlkit/translation';

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
 * Maps incoming language codes (NLLB formats, ISO codes, or names) to ML Kit Language enum.
 * 
 * @param {string} code - Language code, e.g. 'eng_Latn', 'kan_Knda', 'en', 'kn'
 * @returns {string} ML Kit Language string ('en' or 'kn')
 */
export function mapCodeToMlKitLanguage(code) {
  if (!code) return Language.English;
  const normalized = String(code).toLowerCase().trim();

  // Match Kannada
  if (normalized.startsWith('kan') || normalized === 'kn' || normalized.includes('knda')) {
    return Language.Kannada; // 'kn'
  }

  // Match English
  if (normalized.startsWith('eng') || normalized === 'en' || normalized.includes('latn')) {
    return Language.English; // 'en'
  }

  // Check if directly a valid ML Kit Language enum value
  if (Object.values(Language).includes(code)) {
    return code;
  }

  return Language.English;
}

/**
 * Human-readable label for ML Kit languages.
 */
export function getLanguageLabel(language) {
  if (language === Language.Kannada || language === 'kn' || language === 'kan_Knda') {
    return 'Kannada';
  }
  if (language === Language.English || language === 'en' || language === 'eng_Latn') {
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
 * @param {string} options.language - ML Kit Language (e.g. Language.English or Language.Kannada)
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

  try {
    console.info(`[OfflineTranslation] Initiating download for ${langLabel} (${mlKitLang})...`);
    await Translation.downloadModel({ language: mlKitLang });
    console.info(`[OfflineTranslation] Successfully downloaded ${langLabel} model pack.`);
  } catch (err) {
    console.error(`[OfflineTranslation] Download failed for ${langLabel}:`, err);
    throw new Error(
      `Failed to download ${langLabel} language model: ${err.message || 'Check your internet connection and try again.'}`
    );
  }
}

/**
 * Deletes a downloaded language model pack from the device storage.
 * 
 * @param {Object} options
 * @param {string} options.language - ML Kit Language (e.g. Language.English or Language.Kannada)
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
 * Executes on-device translation using the local ML Kit neural model.
 * 
 * Performs safety checks:
 * 1. Confirms the device platform is native Android or iOS.
 * 2. Checks that required language packs (source & target) are downloaded.
 * 3. Never returns fake strings; raises clean, friendly error messages if prerequisites fail.
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

  // 1. Guard platform support
  if (!isOfflineTranslationSupported()) {
    throw new Error(
      'Offline on-device translation is only available on native Android and iOS devices. ' +
      'In web browsers, please reconnect to the internet to use the online NLLB backend.'
    );
  }

  const sourceLanguage = mapCodeToMlKitLanguage(sourceLang);
  const targetLanguage = mapCodeToMlKitLanguage(targetLang);
  const srcLabel = getLanguageLabel(sourceLanguage);
  const tgtLabel = getLanguageLabel(targetLanguage);

  // 2. Verify whether model packs are downloaded on device
  let downloadedModels = [];
  try {
    const checkResult = await Translation.getDownloadedModels();
    downloadedModels = checkResult.languages || [];
  } catch (err) {
    console.warn('[OfflineTranslation] Could not query downloaded models:', err);
  }

  const hasSource = downloadedModels.includes(sourceLanguage);
  const hasTarget = downloadedModels.includes(targetLanguage);

  if (!hasSource || !hasTarget) {
    const missing = [];
    if (!hasSource) missing.push(srcLabel);
    if (!hasTarget) missing.push(tgtLabel);

    throw new Error(
      `The offline language pack for ${missing.join(' and ')} is not downloaded. ` +
      `Please connect to the internet and download the model pack from the Offline Models manager before translating offline.`
    );
  }

  // 3. Execute translation on-device
  try {
    const startTime = performance.now();
    const result = await Translation.translate({
      text: trimmedText,
      sourceLanguage,
      targetLanguage,
    });
    const latencyMs = Math.round(performance.now() - startTime);

    return {
      source_text: trimmedText,
      translated_text: result.text,
      source_lang: sourceLang,
      target_lang: targetLang,
      model_variant: 'mlkit_offline',
      latency_ms: latencyMs,
      mode: 'offline',
      engine: 'Offline On-Device Model',
    };
  } catch (err) {
    console.error('[OfflineTranslation] Translation execution error:', err);
    throw new Error(
      `On-device translation error: ${err.message || 'Failed to translate using local model.'}`
    );
  }
}
