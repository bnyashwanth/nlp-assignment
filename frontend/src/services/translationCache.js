/**
 * LinguaBridge AI - Translation Cache Manager
 * ============================================
 * Module: frontend/src/services/translationCache.js
 * 
 * Provides fast, offline-capable localStorage caching for translations.
 * Automatically saves successful online and offline translations so repeated
 * queries work instantaneously without network or re-computation.
 */

const CACHE_STORAGE_KEY = 'linguabridge_translation_cache';
const MAX_CACHE_ENTRIES = 100;

/**
 * Generates a unique cache key based on language pair and normalized text.
 */
function makeKey(text, sourceLang, targetLang) {
  const s = String(sourceLang || '').toLowerCase().trim();
  const t = String(targetLang || '').toLowerCase().trim();
  const normalized = String(text || '').toLowerCase().trim();
  return `${s}::${t}::${normalized}`;
}

/**
 * Loads entire cache map from localStorage.
 */
function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('[TranslationCache] Failed to load cache from localStorage:', err);
    return {};
  }
}

/**
 * Saves entire cache map to localStorage.
 */
function persistCache(cacheMap) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheMap));
  } catch (err) {
    console.warn('[TranslationCache] Failed to persist cache to localStorage:', err);
  }
}

/**
 * Retrieves a cached translation result if present.
 * 
 * @param {string} text - Source text
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {Object|null} Cached response object or null
 */
export function getCachedTranslation(text, sourceLang, targetLang) {
  if (!text || !text.trim()) return null;
  const key = makeKey(text, sourceLang, targetLang);
  const cache = loadCache();
  const entry = cache[key];

  if (entry && entry.translated_text) {
    console.info(`[TranslationCache] Cache hit for: "${text.slice(0, 30)}..."`);
    return {
      ...entry,
      latency_ms: 1, // instantaneous from cache
      isCached: true,
      engine: `${entry.engine || 'Neural Translation'} (Cached)`,
    };
  }

  return null;
}

/**
 * Stores a translation result in the cache.
 * 
 * @param {string} text - Source text
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @param {Object} result - Translation output payload
 */
export function saveCachedTranslation(text, sourceLang, targetLang, result) {
  if (!text || !text.trim() || !result || !result.translated_text) return;
  const key = makeKey(text, sourceLang, targetLang);
  const cache = loadCache();

  // Enforce maximum cache entries (remove oldest if full)
  const keys = Object.keys(cache);
  if (keys.length >= MAX_CACHE_ENTRIES && !cache[key]) {
    delete cache[keys[0]];
  }

  cache[key] = {
    translated_text: result.translated_text,
    source_text: text,
    source_lang: sourceLang,
    target_lang: targetLang,
    model_variant: result.model_variant || 'cached',
    engine: result.engine || 'Translation Engine',
    timestamp: Date.now(),
  };

  persistCache(cache);
}

/**
 * Clears all cached translations.
 */
export function clearTranslationCache() {
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch (err) {
    console.warn('[TranslationCache] Error clearing cache:', err);
  }
}
