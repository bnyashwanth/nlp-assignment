# Presentation Brief

## 1. Project Overview

- **Visible app name:** Setu. The repository also retains the previous name **LinguaBridge AI** in older documentation, comments, storage keys, and `frontend/capacitor.config.json`.
- **Purpose:** A multilingual text translation application with a React web frontend, a Python FastAPI translation service, and an Android Capacitor application.
- **Supported language codes:**
  - English: `eng_Latn` / `en`
  - Kannada: `kan_Knda` / `kn`
  - Hindi: `hin_Deva` / `hi`
  - Tamil: `tam_Taml` / `ta`
  - Telugu: `tel_Telu` / `te`
- **Target platforms:** Browser-based web app and Android APK.
- **Current Android package/application ID:** `ai.linguabridge.app`, retained in `frontend/capacitor.config.json`, `frontend/android/app/build.gradle`, `MainActivity`, and Android resources.

## 2. System Architecture

### Web frontend

- The React application is in `frontend/src/`.
- `frontend/src/App.jsx` owns the current top navigation and switches among Home, Translator, and History views.
- `frontend/src/hooks/useTranslation.js` manages text, source/target language state, loading state, local history, and translation execution.
- `frontend/src/services/translationApi.js` is the central web/native translation router.

### Web-to-FastAPI translation

- On web platforms, `translateText()` attempts `POST /api/translate` on the backend resolved by:
  - `linguabridge_backend_url` in `localStorage`
  - `VITE_API_BASE_URL`
  - `http://localhost:8000`
- Translation requests use a `45000 ms` timeout.
- Successful responses are cached in `localStorage` through `frontend/src/services/translationCache.js`.
- If a web request fails, times out, or the device reports offline, the router uses a cached result when available and then calls the bundled JavaScript fallback.

### Python FastAPI backend

- The repository contains two FastAPI entry structures:
  - `backend/main.py`
  - `backend/app/main.py`
- The primary route modules are under `backend/app/api/translation_routes.py`, and the model implementation is under `backend/translator.py` and `backend/app/models/model_loader.py`.
- The backend is configured to use `facebook/nllb-200-distilled-600M`.
- It loads a SentencePiece/NLLB tokenizer, loads the base Seq2Seq model on CPU or CUDA, and attempts optional PEFT LoRA adapter loading.
- Translation generation uses forced target-language IDs and beam search.
- The backend exposes language, translation, comparison, metrics, and health routes.
- The backend code also contains a deterministic dictionary/simulation fallback for known text and model-loading failures.

### Android native layer

- The Vite web bundle is synchronized into the Android project with Capacitor.
- `frontend/android/app/src/main/java/ai/linguabridge/app/MainActivity.java` extends `BridgeActivity` and registers `NllbOfflinePlugin`.
- `NllbOfflinePlugin` is registered as a Capacitor plugin in `frontend/android/app/src/main/java/ai/linguabridge/app/NllbOfflinePlugin.java`.
- On native Android, `frontend/src/services/translationApi.js` calls `NllbOfflinePlugin.translate({ text, sourceLang, targetLang })` before any web fallback path.
- The native plugin copies ONNX and tokenizer assets once into `context.filesDir/nllb/`, creates ONNX Runtime encoder and decoder sessions, performs tokenizer-driven input assembly and autoregressive decoding, and returns `translatedText` plus `latencyMs`.
- If native plugin execution fails, the JavaScript router continues to its existing cache or bundled offline NLP fallback.

### Offline and cache mechanisms

- `frontend/src/services/translationCache.js` persists successful translations in `localStorage` under `linguabridge_translation_cache`, with a maximum of 100 entries.
- `frontend/src/hooks/useTranslation.js` separately persists the most recent 30 translation history entries under `linguabridge_translation_history`.
- `frontend/src/services/offlineTranslation.js` routes into `frontend/src/nlp/offlineNlpEngine.js`.
- Android ONNX assets are expected under `frontend/android/app/src/main/assets/nllb/` and are excluded from Git.

## 3. NLP Pipeline & Implementation Details

### Frontend NLP implementation

The JavaScript implementation is in `frontend/src/nlp/offlineNlpEngine.js`.

- **Unicode NFC normalization:** `normalizeNFC(text)` calls `text.normalize("NFC")` and trims whitespace.
- **Script detection:** `detectScript(text)` identifies Latin, Kannada, Devanagari, Tamil, or Telugu Unicode ranges.
- **Language key mapping:** `getLangKey(code)` maps FLORES-200 and ISO language forms to `en`, `kn`, `hi`, `ta`, or `te`.
- **Tokenization and punctuation filtering:** `tokenizeText(text)` extracts Latin/Indic words and selected punctuation marks while ignoring other text separators.
- **English stemming:** `stemEnglishWord(word)` uses `STEM_MAP` plus simple `ing`, `ed`, and `s` suffix handling.
- **Minimum Edit Distance typo correction:** `computeLevenshtein(s1, s2)` implements dynamic-programming Levenshtein distance. `correctTypoMED(word, vocabulary)` snaps misspellings to a known English vocabulary within a bounded edit distance.
- **Exact phrase lookup:** `findExactPhraseMatch(text, srcKey, tgtKey)` checks normalized whole-sentence entries in `PHRASES`.
- **Greedy n-gram lookup:** `matchNGrams()` checks 4-, 3-, 2-, and 1-token matches against `MULTIWORD_LEXICON`, `PHRASES`, and `CORE_LEXICON`.
- **SVO-to-SOV reordering:** `applySvoToSovReordering()` moves a detected subject/verb/object-like structure toward subject-object-verb order for English-to-Indic translations.
- **Punctuation and output formatting:** `translateOfflineNLP()` reattaches punctuation, preserves a sentence terminator, and title-cases an English target only by capitalizing the first character.
- **Lexicon data:** `frontend/src/nlp/lexiconData.js` supplies `PHRASES`, `MULTIWORD_LEXICON`, `CORE_LEXICON`, and `STEM_MAP`.

### Script and text validation in the backend

The Python implementation is in `backend/nlp_utils.py`.

- `normalize_text(text)` performs Unicode NFC normalization, removes zero-width spaces, collapses whitespace, and trims text.
- `remove_punctuation(text)` removes ASCII punctuation and Indic danda marks.
- `tokenize_words(text)` performs multilingual word tokenization for Latin and Indic Unicode ranges.
- `tokenize_sentences(text)` segments sentences on `.`, `!`, `?`, `।`, and `॥`.
- `get_character_ngrams(text, n)` creates character n-grams.
- `analyze_script_proportions(text)` calculates Latin, Kannada, Devanagari, Tamil, and Telugu character proportions.
- `detect_dominant_script(text)` returns the dominant canonical FLORES language code or `unknown`.
- `validate_script_match(text, expected_lang)` checks text against the expected source script.
- `has_repetition_loops(text, n, threshold)` detects repeated n-gram output loops.
- `levenshtein_distance(s1, s2)` implements dynamic-programming Levenshtein distance.
- `string_similarity_ratio(s1, s2)` and `word_error_rate(reference, hypothesis)` derive similarity and token-level error measurements.
- `normalize_lang_code(code)` and `to_iso_code(code)` convert supported language names and ISO/FLORES codes.

### Neural machine translation

- `frontend/src/services/translationApi.js` sends FastAPI requests for web NLLB-200 inference.
- `backend/translator.py` and `backend/app/models/model_loader.py` load `facebook/nllb-200-distilled-600M`, configure source and target language IDs, and run Seq2Seq generation.
- The backend and frontend define baseline/LoRA model variant names; LoRA adapter handling is implemented in the backend model loaders.
- The Android plugin implements native encoder/decoder ONNX sessions with language-code tokens and an autoregressive loop up to 128 steps.

## 4. Frontend UI & Navigation Structure

- **Branding:** The current visible brand is **Setu** in `frontend/src/App.jsx`.
- **Icon:** `frontend/public/setu-icon.svg` contains the reusable Setu bridge-style monochrome icon.
- **Favicon:** `frontend/index.html` points to `/setu-icon.svg`.
- **Android launcher:** Setu PNG assets are present in the `mipmap-*` resource folders and adaptive icons reference `mipmap/ic_launcher_foreground` with a monochrome launcher background.
- **Top navigation:** The current `frontend/src/App.jsx` header contains only **Home** and **History**.
- **Home view:** Displays the five-language label, a Setu headline and short product explanation, a primary CTA to the translator, and three feature cards.
- **Translator view:** `frontend/src/components/TranslateView.jsx` provides:
  - `FROM` selector with `Auto-detect`
  - English, Kannada, Hindi, Tamil, and Telugu options
  - Circular language swap control
  - `TO` selector
  - Source textarea with `0 / 4000` character counter
  - Source/translation Speak and Clear/Copy controls
  - Translation output box
  - `Translate` button
- **History view:** `frontend/src/components/HistoryView.jsx` provides a searchable list, clear-history control, and selection of a past entry for reuse.
- **Intentional simplification:** The active `App.jsx` no longer renders the old left sidebar or separate Settings, Saved, Languages, Offline Model Manager, Compare Models, metrics, or `22RI52` status surfaces. The repository also contains older implementation comments and optional backend metrics/comparison code, but those surfaces are not assembled into the current `App.jsx`.
- **Naming residue:** `frontend/capacitor.config.json` still has `"appName": "LinguaBridge AI"`; Android resource strings and the visible React interface use Setu.

## 5. Android Build, CI & Offline Setup

### Android Gradle and Capacitor

- `frontend/capacitor.config.json` sets `appId: ai.linguabridge.app`, `appName: LinguaBridge AI`, and `webDir: dist`.
- `frontend/android/app/build.gradle`:
  - Uses namespace and application ID `ai.linguabridge.app`
  - Configures `arm64-v8a` and `armeabi-v7a` native ABIs
  - Marks `onnx`, `model`, and `json` assets as uncompressed in both `aaptOptions` and `androidResources`
  - Includes `com.microsoft.onnxruntime:onnxruntime-android:1.20.0`
- `frontend/android/gradle.properties` sets `org.gradle.jvmargs=-Xmx4096m`.
- `frontend/android/app/src/main/AndroidManifest.xml` sets `android:largeHeap="true"`, internet/network permissions, and uses `@string/app_name`.
- `frontend/android/app/src/main/res/values/strings.xml` identifies the visible app name as `Setu`.
- `MainActivity` registers `NllbOfflinePlugin`.

### Native ONNX plugin

- `NllbOfflinePlugin` loads:
  - `encoder_model_quantized.onnx`
  - `decoder_model_merged_quantized.onnx`
  - `tokenizer.json`
  - `sentencepiece.bpe.model`
  - `config.json`
- Assets are copied from `assets/nllb/` into `context.filesDir/nllb/`.
- The plugin uses `OrtEnvironment`, `OrtSession.SessionOptions`, `OrtSession`, `OnnxTensor`, `OrtSession.Result`, and `OrtException`.
- Session setup uses `options.setMemoryPatternOptimization(false)` rather than the older `setMemoryPattern` API.
- Session and tensor resources are closed in the implementation, and plugin failures are returned to JavaScript using `NLLB_ONNX_ERROR`.

### Model asset delivery

- `.gitignore` excludes `frontend/android/app/src/main/assets/nllb/` and `*.onnx`.
- No baked ONNX model files are currently present in `frontend/android/app/src/main/assets/nllb/` in the working repository snapshot.
- `.github/workflows/build-apk.yml` downloads the five Xenova model assets from the Hugging Face `nllb-200-distilled-600M` repository immediately before the Gradle build.
- The workflow:
  - Checks out the repository
  - Uses Node 20 and Temurin JDK 21
  - Runs `npm ci`
  - Runs `npm run build`
  - Runs `npx cap sync android`
  - Creates the `nllb/` assets directory
  - Runs `./gradlew assembleDebug`
  - Uploads `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## 6. Verification & Current Status

### Confirmed passing in this workspace

- `npm --prefix frontend run build`
  - Completed successfully with the Vite production bundle.
- `cd frontend && npx cap sync android`
  - Completed successfully and copied web assets into the Android project.

### Tests and scripts present

- `backend/test_backend.py` is a repository verification script covering NLP utilities, language catalog entries, metrics payload fields, translation responses, reverse translations, and error handling.
- The script is a standalone Python runner under `if __name__ == "__main__"` rather than a pytest test module.
- Its own printed summaries claim that tests pass, but this presentation brief does not treat those printed claims as independently executed verification without an actual recorded run in the current verification environment.
- The repository README and setup docs list additional ML commands for data cleaning, back-translation, LoRA training, evaluation, and Hugging Face publishing:
  - `python ml/data_cleaning.py`
  - `python ml/back_translation.py`
  - `python ml/train_lora.py`
  - `python ml/evaluate.py`
  - `python ml/push_to_hub.py`
- These scripts are present, but their model-training, Hub-publishing, and benchmark outputs are not independently re-run here.

### Android status

- The native plugin source and Gradle dependency are present.
- A local Gradle Android compilation was attempted, but it stopped before Java compilation because the local machine had no Android SDK location configured (`ANDROID_HOME`/`sdk.dir`).
- The ONNX asset download and `./gradlew assembleDebug` sequence exists in `.github/workflows/build-apk.yml`, but no successful CI run or local APK build result is recorded in the repository snapshot.
- The native plugin's real ONNX inference behavior and generated APK therefore still require a machine or CI runner with the Android SDK and baked model assets.

### Known repository naming residue

- Current visible branding and Android resources use Setu.
- Older LinguaBridge AI names remain in documentation, comments, package metadata, storage keys, and `frontend/capacitor.config.json`.
