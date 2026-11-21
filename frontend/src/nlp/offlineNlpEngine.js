/**
 * LinguaBridge AI - Pure-NLP Offline Translation Engine
 * =====================================================
 * Module: frontend/src/nlp/offlineNlpEngine.js
 * 
 * 100% Client-Side Neural/Symbolic NLP Engine based on 22RI52 Lab Concepts:
 * - Exp 1: Unicode NFC Normalization, Multilingual Tokenization, Script Validation & Stemming
 * - Exp 2: Greedy N-Gram Longest-Match Phrase Lookup (4-gram -> 3-gram -> 2-gram -> 1-gram)
 * - Exp 3: Minimum Edit Distance (MED) Dynamic Programming Typo Correction (Levenshtein)
 * - Syntactic Structure Transformation: SVO (English) -> SOV (Kannada, Hindi, Tamil, Telugu)
 * 
 * Works 100% offline out-of-the-box on web and Android APK with ZERO ML Kit or external model downloads.
 */

import { PHRASES, MULTIWORD_LEXICON, CORE_LEXICON, STEM_MAP } from './lexiconData.js';

// Map FLORES / ISO codes to simple language key
export function getLangKey(code) {
  if (!code) return 'en';
  const c = code.toLowerCase();
  if (c.startsWith('kn') || c.includes('knda')) return 'kn';
  if (c.startsWith('hi') || c.includes('deva')) return 'hi';
  if (c.startsWith('ta') || c.includes('taml')) return 'ta';
  if (c.startsWith('te') || c.includes('telu')) return 'te';
  return 'en';
}

/**
 * Exp 1: Unicode NFC Normalization
 */
export function normalizeNFC(text) {
  if (!text) return '';
  return text.normalize('NFC').trim();
}

/**
 * Exp 1: Script Validation & Character Block Detection
 */
export function detectScript(text) {
  if (!text) return 'unknown';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada';
  if (/[\u0900-\u097F]/.test(text)) return 'devanagari';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
  if (/[a-zA-Z]/.test(text)) return 'latin';
  return 'other';
}

/**
 * Exp 1: Multilingual Tokenizer
 * Preserves Indic conjunct aksharas, separates words, and isolates punctuation.
 */
export function tokenizeText(text) {
  if (!text) return [];
  const normalized = normalizeNFC(text);
  // Matches words in Latin or Indic scripts, or standalone punctuation
  const tokens = [];
  const regex = /([\u0C80-\u0CFF\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7Fa-zA-Z0-9]+|[.,!?;:।॥"'])/g;
  let match;
  while ((match = regex.exec(normalized)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
}

/**
 * Exp 1: Lightweight Stemmer for English words
 */
export function stemEnglishWord(word) {
  if (!word) return '';
  const lower = word.toLowerCase();
  if (STEM_MAP[lower]) return STEM_MAP[lower];

  // Common suffix stripping
  if (lower.endsWith('ing') && lower.length > 5) {
    const base = lower.slice(0, -3);
    if (STEM_MAP[base]) return STEM_MAP[base];
    return base;
  }
  if (lower.endsWith('ed') && lower.length > 4) {
    const base = lower.slice(0, -2);
    if (STEM_MAP[base]) return STEM_MAP[base];
    return base;
  }
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 3) {
    const base = lower.slice(0, -1);
    if (STEM_MAP[base]) return STEM_MAP[base];
    return base;
  }
  return lower;
}

/**
 * Exp 3: Minimum Edit Distance (MED) - Dynamic Programming Matrix
 */
export function computeLevenshtein(s1, s2) {
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  const m = a.length;
  const n = b.length;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Deletion
          dp[i][j - 1],     // Insertion
          dp[i - 1][j - 1]  // Substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Exp 3: Typo Snapping using Minimum Edit Distance
 * Corrects typos against known core vocabulary words.
 */
export function correctTypoMED(word, vocabulary) {
  const lower = word.toLowerCase();
  if (vocabulary.has(lower)) {
    return { corrected: lower, distance: 0 };
  }

  const maxAllowedDist = lower.length >= 5 ? 2 : 1;
  let bestCandidate = null;
  let minDistance = Infinity;

  for (const candidate of vocabulary) {
    if (Math.abs(candidate.length - lower.length) > maxAllowedDist) continue;
    const dist = computeLevenshtein(lower, candidate);
    if (dist < minDistance && dist <= maxAllowedDist) {
      minDistance = dist;
      bestCandidate = candidate;
    }
  }

  if (bestCandidate) {
    return { corrected: bestCandidate, distance: minDistance };
  }

  return { corrected: lower, distance: 0 };
}

// Pre-build search indices for high-performance lookup
const ENGLISH_VOCAB = new Set(CORE_LEXICON.map((item) => item.en.toLowerCase()));
const WORD_MAP_EN = new Map();
const WORD_MAP_KN = new Map();
const WORD_MAP_HI = new Map();
const WORD_MAP_TA = new Map();
const WORD_MAP_TE = new Map();

CORE_LEXICON.forEach((item) => {
  WORD_MAP_EN.set(item.en.toLowerCase(), item);
  if (item.kn) WORD_MAP_KN.set(item.kn, item);
  if (item.hi) WORD_MAP_HI.set(item.hi, item);
  if (item.ta) WORD_MAP_TA.set(item.ta, item);
  if (item.te) WORD_MAP_TE.set(item.te, item);
});

// Add all phrases to vocab
PHRASES.forEach((p) => {
  p.en.toLowerCase().split(/\s+/).forEach((w) => {
    const clean = w.replace(/[.,!?;:]/g, '');
    if (clean) ENGLISH_VOCAB.add(clean);
  });
});

/**
 * Checks for full phrase match in parallel corpus
 */
function findExactPhraseMatch(text, srcKey, tgtKey) {
  const normalizedInput = text.trim().toLowerCase().replace(/[।.,!?;:]+$/, '');

  for (const item of PHRASES) {
    const srcVal = (item[srcKey] || '').toLowerCase().replace(/[।.,!?;:]+$/, '');
    if (srcVal === normalizedInput) {
      return item[tgtKey] || null;
    }
  }
  return null;
}

/**
 * Exp 2: Greedy N-Gram Phrase Matching
 * Matches up to 4-gram phrases before falling back to single words.
 */
function matchNGrams(tokens, srcKey, tgtKey, diagnostics) {
  const resultTokens = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // Check if token is punctuation
    if (/^[.,!?;:।॥"']$/.test(token)) {
      resultTokens.push(token);
      i++;
      continue;
    }

    let matched = false;

    // Try 4-gram, 3-gram, 2-gram
    for (let n = Math.min(4, tokens.length - i); n >= 2; n--) {
      const slice = tokens.slice(i, i + n);
      // Skip if slice contains standalone punctuation
      if (slice.some((t) => /^[.,!?;:।॥"']$/.test(t))) continue;

      const phrase = slice.join(' ').toLowerCase();

      // 1. Check in MULTIWORD_LEXICON
      for (const m of MULTIWORD_LEXICON) {
        const mSrc = (m[srcKey] || '').toLowerCase().replace(/[.,!?;:।॥]$/, '');
        if (mSrc === phrase && m[tgtKey]) {
          resultTokens.push(m[tgtKey]);
          diagnostics.matched_ngrams.push({
            phrase,
            translation: m[tgtKey],
            n,
          });
          i += n;
          matched = true;
          break;
        }
      }
      if (matched) break;

      // 2. Check in parallel corpus (exact match)
      for (const p of PHRASES) {
        const pSrc = (p[srcKey] || '').toLowerCase().replace(/[.,!?;:।॥]$/, '');
        if (pSrc === phrase && p[tgtKey]) {
          resultTokens.push(p[tgtKey].replace(/[.,!?;:।॥]$/, ''));
          diagnostics.matched_ngrams.push({
            phrase,
            translation: p[tgtKey],
            n,
          });
          i += n;
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (matched) continue;

    // Single token lookup (1-gram)
    const cleanWord = token.toLowerCase();

    // Typo correction with MED
    let lookupWord = cleanWord;
    if (srcKey === 'en') {
      const { corrected, distance } = correctTypoMED(cleanWord, ENGLISH_VOCAB);
      if (distance > 0) {
        diagnostics.corrections.push({ original: cleanWord, corrected, distance });
        lookupWord = corrected;
      }
      // Also apply stemmer if not found directly
      if (!WORD_MAP_EN.has(lookupWord)) {
        const stem = stemEnglishWord(lookupWord);
        diagnostics.stemmed.push({ word: lookupWord, stem });
        if (WORD_MAP_EN.has(stem)) {
          lookupWord = stem;
        }
      }
    }

    // Lookup in Word Map
    let trans = null;
    if (srcKey === 'en') {
      const entry = WORD_MAP_EN.get(lookupWord);
      trans = entry ? entry[tgtKey] : null;
    } else if (srcKey === 'kn') {
      const entry = WORD_MAP_KN.get(cleanWord);
      trans = entry ? entry[tgtKey] : null;
    } else if (srcKey === 'hi') {
      const entry = WORD_MAP_HI.get(cleanWord);
      trans = entry ? entry[tgtKey] : null;
    } else if (srcKey === 'ta') {
      const entry = WORD_MAP_TA.get(cleanWord);
      trans = entry ? entry[tgtKey] : null;
    } else if (srcKey === 'te') {
      const entry = WORD_MAP_TE.get(cleanWord);
      trans = entry ? entry[tgtKey] : null;
    }

    if (trans) {
      resultTokens.push(trans);
    } else {
      // Keep original token if no translation exists
      resultTokens.push(token);
    }

    i++;
  }

  return resultTokens;
}

/**
 * SVO -> SOV Reordering Transformation
 * English is Subject-Verb-Object (SVO).
 * Indic languages (Kannada, Hindi, Tamil, Telugu) are Subject-Object-Verb (SOV).
 */
function applySvoToSovReordering(tokens, targetLangKey) {
  if (tokens.length < 3) return { tokens, reordered: false };

  // Identify common auxiliary/verb positions in English tokens
  let verbIndex = -1;
  const commonVerbs = new Set([
    'announced', 'announce', 'is', 'are', 'was', 'were', 'have', 'has', 'had',
    'promotes', 'promote', 'transforms', 'transform', 'learns', 'learn', 'studies', 'study',
    'explains', 'explain', 'helps', 'help', 'gives', 'give', 'takes', 'take', 'wants', 'want',
    'needs', 'need', 'likes', 'like', 'reads', 'read', 'writes', 'write', 'eats', 'eat',
  ]);

  for (let i = 1; i < tokens.length - 1; i++) {
    const word = tokens[i].toLowerCase();
    if (commonVerbs.has(word) || STEM_MAP[word]) {
      verbIndex = i;
      break;
    }
  }

  // If SVO pattern detected: Subject [0..verbIndex-1], Verb [verbIndex], Object [verbIndex+1..end]
  if (verbIndex > 0 && verbIndex < tokens.length - 1) {
    const subject = tokens.slice(0, verbIndex);
    const verb = tokens[verbIndex];
    const object = tokens.slice(verbIndex + 1);

    // Reorder to Subject + Object + Verb
    return {
      tokens: [...subject, ...object, verb],
      reordered: true,
    };
  }

  return { tokens, reordered: false };
}

/**
 * Main Pure-NLP Offline Translation Function
 * 
 * @param {Object} params
 * @param {string} params.text - Input text to translate
 * @param {string} params.source_lang - e.g. 'eng_Latn', 'en', 'kan_Knda', 'kn'
 * @param {string} params.target_lang - e.g. 'kan_Knda', 'kn', 'hin_Deva', 'hi'
 * @returns {Promise<Object>} Translation response payload
 */
export async function translateOfflineNLP({ text, source_lang, target_lang }) {
  const startTime = performance.now();
  const rawText = (text || '').trim();

  if (!rawText) {
    return {
      translated_text: '',
      source_lang,
      target_lang,
      engine: 'Offline Pure-NLP Engine',
      mode: 'offline',
      latency_ms: 0,
      diagnostics: null,
    };
  }

  const srcKey = getLangKey(source_lang);
  const tgtKey = getLangKey(target_lang);

  // Exp 1: Normalize input with Unicode NFC
  const normalizedText = normalizeNFC(rawText);

  const diagnostics = {
    normalized_nfc: true,
    detected_script: detectScript(normalizedText),
    tokens: [],
    stemmed: [],
    corrections: [],
    matched_ngrams: [],
    reordered_sov: false,
  };

  // 1. Check for whole sentence / exact phrase match in corpus
  const exactMatch = findExactPhraseMatch(normalizedText, srcKey, tgtKey);
  if (exactMatch) {
    const latency = performance.now() - startTime;
    return {
      translated_text: exactMatch,
      source_lang,
      target_lang,
      engine: 'Offline Pure-NLP Engine (Exact Corpus Match)',
      mode: 'offline',
      isOffline: true,
      latency_ms: Math.max(1, Math.round(latency)),
      diagnostics: {
        ...diagnostics,
        matched_type: 'exact_phrase_corpus',
      },
    };
  }

  // 2. Tokenize sentence
  let tokens = tokenizeText(normalizedText);
  diagnostics.tokens = [...tokens];

  // 3. SVO -> SOV Reordering for English to Indic targets
  if (srcKey === 'en' && tgtKey !== 'en') {
    const reorderResult = applySvoToSovReordering(tokens, tgtKey);
    if (reorderResult.reordered) {
      tokens = reorderResult.tokens;
      diagnostics.reordered_sov = true;
    }
  }

  // 4. Greedy N-Gram Longest-Match Phrase Lookup + MED Typo Correction
  const translatedTokens = matchNGrams(tokens, srcKey, tgtKey, diagnostics);

  // 5. Assemble and format translated text
  let resultText = translatedTokens
    .filter((t) => t && t.trim().length > 0)
    .join(' ')
    .replace(/\s+([.,!?;:।॥])/g, '$1') // Reattach punctuation cleanly
    .replace(/([.,!?;:।॥])\s*([.,!?;:।॥])/g, '$1$2')
    .trim();

  // If text doesn't end with sentence terminator, preserve original termination
  const lastChar = normalizedText.slice(-1);
  if (/[.?!।]$/.test(lastChar) && !/[.?!।]/.test(resultText.slice(-1))) {
    resultText += tgtKey === 'hi' ? '।' : lastChar;
  }

  // Ensure first character is uppercase if English target
  if (tgtKey === 'en' && resultText.length > 0) {
    resultText = resultText.charAt(0).toUpperCase() + resultText.slice(1);
  }

  const latency = performance.now() - startTime;

  return {
    translated_text: resultText || rawText,
    source_lang,
    target_lang,
    engine: 'Offline Pure-NLP Engine (22RI52 SVO-SOV + MED)',
    mode: 'offline',
    isOffline: true,
    latency_ms: Math.max(2, Math.round(latency)),
    diagnostics,
  };
}
