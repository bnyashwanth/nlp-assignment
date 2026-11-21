/**
 * Setu - Translation API Client & Pure-NLP Hybrid Routing Service
 * =========================================================================
 * Module: frontend/src/services/translationApi.js
 * 
 * Features:
 * - Dynamic Backend URL: Reads from localStorage ('linguabridge_backend_url') first,
 *   falling back to VITE_API_BASE_URL or 'http://localhost:8000'.
 * - Test Connection helper (GET /health) for laptop/cloud backend connectivity testing.
 * - 45,000 ms timeout for CPU NLLB-200 Seq2Seq neural inference.
 * - Zero-Error Offline Guarantee: If device is offline or backend is unreachable/times out,
 *   seamlessly returns from localStorage cache first, then Pure-NLP engine (Exp 1, 2, 3).
 *   Never displays a red "Failed to fetch" banner when offline.
 * - Clear mode badges: 'Online Python NLLB-200', 'Offline NLP Cache', 'Offline Pure-NLP Engine'.
 */

import { translateOffline } from './offlineTranslation';
import { getCachedTranslation, saveCachedTranslation } from './translationCache';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { detectScript } from '../nlp/offlineNlpEngine';

const NllbOfflinePlugin = registerPlugin('NllbOfflinePlugin');

export const BACKEND_URL_STORAGE_KEY = 'linguabridge_backend_url';
export const DEFAULT_REQUEST_TIMEOUT_MS = 10000;       // 10 seconds for health/metrics
export const TRANSLATION_REQUEST_TIMEOUT_MS = 45000;   // 45 seconds for CPU NLLB inference

/**
 * Retrieves the currently active Backend API Base URL.
 * Priority: 1. localStorage ('linguabridge_backend_url') -> 2. VITE_API_BASE_URL -> 3. http://localhost:8000
 */
export function getBackendBaseUrl() {
  try {
    const custom = localStorage.getItem(BACKEND_URL_STORAGE_KEY);
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    console.warn('[API] Could not access localStorage for backend URL:', e);
  }

  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  return 'http://localhost:8000';
}

/**
 * Persists a new Backend API Base URL into localStorage.
 */
export function setBackendBaseUrl(url) {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(BACKEND_URL_STORAGE_KEY);
    } else {
      localStorage.setItem(BACKEND_URL_STORAGE_KEY, url.trim().replace(/\/+$/, ''));
    }
  } catch (e) {
    console.warn('[API] Failed to store backend URL:', e);
  }
}

/**
 * Tests connection to a backend server (GET /health).
 * 
 * @param {string} [customUrl] - Optional URL to probe. Defaults to getBackendBaseUrl().
 * @returns {Promise<{ ok: boolean, latency_ms?: number, data?: any, error?: string }>}
 */
export async function testBackendConnection(customUrl = null) {
  const baseUrl = (customUrl !== null ? customUrl : getBackendBaseUrl()).trim().replace(/\/+$/, '');
  const url = `${baseUrl}/health`;
  const start = performance.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    clearTimeout(timeoutId);
    const latency_ms = Math.round(performance.now() - start);

    if (response.ok) {
      const data = await response.json();
      return { ok: true, latency_ms, data };
    }
    return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` };
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err.name === 'AbortError' ? 'Connection timed out (6s)' : (err.message || 'Cannot reach server');
    return { ok: false, error: msg };
  }
}

/**
 * Internal fetch wrapper with timeout.
 */
async function request(endpoint, options = {}) {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const timeoutMs = options.timeout || DEFAULT_REQUEST_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const msg = typeof data === 'object' && (data.message || data.detail)
        ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail || data.message))
        : `HTTP error ${response.status}: ${response.statusText}`;
      const error = new Error(msg);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Inference timed out after ${Math.round(timeoutMs / 1000)}s on CPU.`);
      timeoutError.status = 504;
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw err;
  }
}

/**
 * Checks backend health and device telemetry.
 */
export async function getHealth() {
  try {
    return await request('/health', { timeout: 4000 });
  } catch (err) {
    return {
      status: 'offline',
      service: 'Setu (Offline Translation Engine)',
      device: 'client-cpu',
      is_neural_ready: true,
      error: err.message,
    };
  }
}

/**
 * Returns supported languages.
 */
export async function getLanguages() {
  try {
    return await request('/api/languages', { timeout: 4000 });
  } catch {
    return getDefaultLanguagesCatalog();
  }
}

function getDefaultLanguagesCatalog() {
  return {
    languages: [
      { code: 'eng_Latn', iso: 'en', name: 'English', script: 'Latin', native_name: 'English', flag: '🇬🇧' },
      { code: 'kan_Knda', iso: 'kn', name: 'Kannada', script: 'Kannada', native_name: 'ಕನ್ನಡ', flag: '🇮🇳' },
      { code: 'hin_Deva', iso: 'hi', name: 'Hindi', script: 'Devanagari', native_name: 'हिन्दी', flag: '🇮🇳' },
      { code: 'tam_Taml', iso: 'ta', name: 'Tamil', script: 'Tamil', native_name: 'தமிழ்', flag: '🇮🇳' },
      { code: 'tel_Telu', iso: 'te', name: 'Telugu', script: 'Telugu', native_name: 'తెలుగు', flag: '🇮🇳' },
    ],
    supported_pairs: [
      'eng_Latn -> kan_Knda',
      'kan_Knda -> eng_Latn',
      'eng_Latn -> hin_Deva',
      'hin_Deva -> eng_Latn',
      'eng_Latn -> tam_Taml',
      'tam_Taml -> eng_Latn',
      'eng_Latn -> tel_Telu',
      'tel_Telu -> eng_Latn',
    ],
  };
}

/**
 * Zero-Error Hybrid Translation Router
 * ====================================
 * Guaranteed never to crash with a red fetch error:
 * 1. If offline: checks local cache -> runs pure-NLP engine.
 * 2. If online: calls FastAPI backend (POST /api/translate, timeout 45s).
 * 3. If online backend fails or times out: seamlessly falls back to cache -> pure-NLP engine.
 */
export async function translateText({
  text,
  source_lang = 'eng_Latn',
  target_lang = 'kan_Knda',
  model_variant = 'lora_bt',
  num_beams = 4,
  isOnline = true,
}) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return {
      source_text: '',
      translated_text: '',
      source_lang,
      target_lang,
      model_variant,
      latency_ms: 0,
      mode: 'online',
      engine: 'Online Python NLLB-200',
    };
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const nativeResult = await NllbOfflinePlugin.translate({
        text: trimmed,
        sourceLang: source_lang,
        targetLang: target_lang,
      });
      const result = {
        source_text: trimmed,
        translated_text: nativeResult.translatedText,
        source_lang,
        target_lang,
        mode: 'offline',
        engine: 'Offline Xenova NLLB-200 ONNX',
        isOffline: true,
        latency_ms: nativeResult.latencyMs || 0,
      };
      saveCachedTranslation(trimmed, source_lang, target_lang, result);
      return result;
    } catch (nativeError) {
      console.warn('[NllbOfflinePlugin] Native ONNX unavailable, using bundled NLP fallback:', nativeError.message);
    }
  }

  // 1. Check local cache
  const cached = getCachedTranslation(trimmed, source_lang, target_lang);

  // 2. If disconnected: return cache or run pure-NLP engine immediately
  if (!isOnline) {
    if (cached) {
      return {
        ...cached,
        mode: 'offline',
        engine: 'Offline NLP Cache',
        isOffline: true,
      };
    }

    const offlineResult = await translateOffline({
      text: trimmed,
      sourceLang: source_lang,
      targetLang: target_lang,
    });
    saveCachedTranslation(trimmed, source_lang, target_lang, offlineResult);
    return {
      ...offlineResult,
      mode: 'offline',
      engine: 'Offline Pure-NLP Engine',
    };
  }

  // 3. Online: attempt FastAPI backend call
  try {
    const response = await request('/api/translate', {
      method: 'POST',
      timeout: TRANSLATION_REQUEST_TIMEOUT_MS,
      body: JSON.stringify({
        text: trimmed,
        source_lang,
        target_lang,
        model_variant,
        num_beams,
      }),
    });

    if (response && typeof response.translated_text === 'string') {
      const result = {
        ...response,
        mode: 'online',
        engine: 'Online Python NLLB-200',
        latency_ms: response.latency_ms || 45,
      };
      saveCachedTranslation(trimmed, source_lang, target_lang, result);
      return result;
    }
  } catch (backendErr) {
    console.warn('[HybridRouter] Online backend failed or unreachable. Seamlessly falling back to Pure-NLP offline engine:', backendErr.message);
  }

  // 4. Seamless Fallback (Never show red error banner)
  if (cached) {
    return {
      ...cached,
      mode: 'offline',
      engine: 'Offline NLP Cache (Fallback)',
      isFallback: true,
    };
  }

  const fallbackResult = await translateOffline({
    text: trimmed,
    sourceLang: source_lang,
    targetLang: target_lang,
  });

  const finalFallback = {
    ...fallbackResult,
    mode: 'offline',
    engine: 'Offline Pure-NLP Engine (Fallback)',
    isFallback: true,
  };

  saveCachedTranslation(trimmed, source_lang, target_lang, finalFallback);
  return finalFallback;
}

/**
 * Comparative 3-way translation across Baseline, LoRA, and LoRA+BT.
 */
export async function compareModels({ text, source_lang = 'eng_Latn', target_lang = 'kan_Knda' }) {
  const trimmed = (text || '').trim();
  if (!trimmed) return null;

  try {
    return await request('/api/compare', {
      method: 'POST',
      timeout: TRANSLATION_REQUEST_TIMEOUT_MS,
      body: JSON.stringify({
        text: trimmed,
        source_lang,
        target_lang,
      }),
    });
  } catch (err) {
    console.warn('[API] Remote comparison unavailable, using bundled fallback:', err.message);
    return null;
  }
}

/**
 * Retrieves empirical SacreBLEU & chrF++ metrics.
 */
export async function getMetrics() {
  try {
    return await request('/api/metrics', { timeout: 4000 });
  } catch {
    return null;
  }
}

