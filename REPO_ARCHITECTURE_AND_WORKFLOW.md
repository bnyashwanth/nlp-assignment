# Repository Architecture and Workflow Audit

Audit scope: the repository snapshot at `C:\Users\Yashwanth\Desktop\NLP`, including
`frontend/`, generated Capacitor Android sources, `backend/`, `ml/`, `.github/`,
configuration files, manifests, scripts, data/artifacts, and existing documentation.

This report distinguishes implementation evidence from documentation claims. Anything
that cannot be established from repository contents is marked `[UNVERIFIED]`; an
expected artifact that is absent is marked `[NOT FOUND IN REPO]`.

### IndicTrans2 upgrade status

The web modular backend under `backend/app/` has been upgraded to route among the
AI4Bharat IndicTrans2 1B families `ai4bharat/indictrans2-en-indic-1B`,
`ai4bharat/indictrans2-indic-en-1B`, and
`ai4bharat/indictrans2-indic-indic-1B`. The Android native plugin upgrade is
implemented as `frontend/android/app/src/main/java/ai/linguabridge/app/IndicTransOfflinePlugin.java`;
the export procedure is implemented in `scripts/export_android_indictrans2.py`.
Model downloads and real inference remain `[UNVERIFIED]` until a Hugging Face
authorized model cache/token is available and Android SDK/model assets are tested.

## 1. Exact System Architecture

### 1.1 Component topology

The repository contains four separately implemented areas:

1. **Active frontend:** a Vite-built React application rooted at
   `frontend/index.html`, mounted by `frontend/src/main.jsx`, and assembled by
   `frontend/src/App.jsx`.
2. **Capacitor Android shell:** the checked-in Android project under
   `frontend/android/`. It embeds the Vite `dist/` output and registers a native
   `NllbOfflinePlugin`.
3. **Two backend implementations:**
   - The modular implementation under `backend/app/`, used by
     `backend/Dockerfile` as `app.main:app`.
   - The older monolithic implementation under `backend/main.py`,
     `backend/translator.py`, `backend/nlp_utils.py`, and `backend/schemas.py`.
     `docs/SETUP.md` instructs users to start this older entry point.
4. **Offline/ML layers:**
   - Browser/Android JavaScript symbolic NLP and local cache under
     `frontend/src/nlp/` and `frontend/src/services/`.
   - Python corpus preparation, back-translation, LoRA training, evaluation, and
     Hugging Face publishing under `ml/`.

 There is no separate database, queue, authentication service, or server-side
 history store in the repository. History and translation cache are browser
 `localStorage` entries.

### 1.2 Exact request/data-flow diagram

```text
WEB: user
  |
  v
frontend/index.html
  -> frontend/src/main.jsx
  -> frontend/src/App.jsx
  -> TranslateView.jsx + useTranslation.js
  -> detectScript() when source language is "auto"
  |
  +-- navigator.onLine = false ------------------------------+
  |                                                           |
  |  translationApi.translateText()                          |
  |    -> translationCache.getCachedTranslation()             |
  |       -> cache hit: localStorage result -> React output   |
  |       -> miss: offlineTranslation.translateOffline()     |
  |          -> offlineNlpEngine.translateOfflineNLP()       |
  |             NFC -> tokenize -> n-gram lookup ->           |
  |             Levenshtein typo correction/stemming ->       |
  |             optional English SVO->Indic SOV reorder       |
  |             -> output + diagnostics -> cache/history     |
  |                                                           |
  +-- navigator.onLine = true -------------------------------+
      |
      | POST {text, source_lang, target_lang, model_variant,
      |       num_beams} to <backend-base>/api/translate
      |      (timeout: 45 seconds)
      v
    FastAPI implementation selected by the launched entry point
      |
      +-- backend/main.py -> nlp_utils -> translator.py
      |      NFC/whitespace normalization -> language normalization ->
      |      TranslationEngine -> local NLLB cache or Hugging Face model ->
      |      optional LoRA adapter -> beam generation -> JSON response
      |
      +-- backend/app/main.py -> translation_routes.py
             -> validation.py -> preprocessing.py ->
             translation_service.py -> model_loader.py
             -> local/Hugging Face NLLB + optional LoRA -> JSON response
      |
      v
    React receives translated_text/latency/engine
      -> translationCache.saveCachedTranslation()
      -> useTranslation history state
      -> localStorage key linguabridge_translation_history
      -> TranslateView output

ANDROID/CAPACITOR:
  React bundle -> useNetwork/useTranslation -> translationApi.translateText()
    -> Capacitor.isNativePlatform() is true
    -> NllbOfflinePlugin.translate()
       -> assets/nllb/* copied to app filesDir/nllb/
       -> ONNX Runtime encoder session
       -> greedy decoder session loop (up to 128 steps)
       -> tokenizer.json vocabulary decode
       -> translatedText/latencyMs
    -> cache/history/local UI output
    -> if native ONNX fails: JavaScript offline NLP fallback
    -> [The native branch returns before the backend branch when successful.]

ML/TRAINING (not an online request path):
  ml/data/generate_sample_data.py or raw corpus
    -> ml/data_cleaning.py
       NFC/dedup/script/length filters -> 80/10/10 JSONL split
    -> ml/back_translation.py
       Kannada -> English NLLB beam search -> quality filters
       -> synthetic_parallel.jsonl + optional train_augmented.jsonl
    -> ml/train_lora.py
       NLLB-200 + PEFT LoRA -> adapter checkpoint
    -> ml/evaluate.py
       baseline vs LoRA vs LoRA+BT -> SacreBLEU/chrF++ JSON artifacts
    -> ml/push_to_hub.py -> Hugging Face Hub adapter/model card
```

### 1.3 Major directories and entry points

| Area | Exact paths and roles |
|---|---|
| Root documentation/config | `README.md`, `PRESENTATION_BRIEF.md`, `skills-lock.json`, `.gitignore`, `.env` (present but empty and ignored) |
| Frontend entry | `frontend/index.html`, `frontend/src/main.jsx`, `frontend/src/App.jsx` |
| Frontend views | `frontend/src/components/TranslateView.jsx`, `frontend/src/components/HistoryView.jsx` |
| Frontend state/network | `frontend/src/hooks/useTranslation.js`, `frontend/src/hooks/useNetwork.js` |
| Frontend API/cache | `frontend/src/services/translationApi.js`, `frontend/src/services/translationCache.js`, `frontend/src/services/offlineTranslation.js`, `frontend/src/services/localOfflineFallback.js` |
| Frontend NLP | `frontend/src/nlp/offlineNlpEngine.js`, `frontend/src/nlp/lexiconData.js` |
| Frontend build/config | `frontend/package.json`, `frontend/package-lock.json`, `frontend/vite.config.js`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/capacitor.config.json`, `frontend/vercel.json`, `frontend/.env.example` |
| Legacy frontend | `frontend/app.js`, `frontend/style.css`, and the root-level static markup/config files. `frontend/app.js` is not imported by the active React `index.html`. |
| Capacitor Android | `frontend/android/settings.gradle`, `frontend/android/build.gradle`, `frontend/android/variables.gradle`, `frontend/android/gradle.properties`, `frontend/android/gradlew`, `frontend/android/gradlew.bat`, `frontend/android/gradle/wrapper/gradle-wrapper.properties` |
| Android app | `frontend/android/app/build.gradle`, `frontend/android/app/capacitor.build.gradle`, `frontend/android/app/src/main/AndroidManifest.xml`, `frontend/android/app/src/main/java/ai/linguabridge/app/MainActivity.java`, `frontend/android/app/src/main/java/ai/linguabridge/app/NllbOfflinePlugin.java` |
| Android resources | `frontend/android/app/src/main/res/`, including launcher, splash, layout, values, and provider-path resources |
| Android generated/plugin project | `frontend/android/capacitor.settings.gradle`, `frontend/android/capacitor-cordova-android-plugins/` |
| Modular backend entry | `backend/app/main.py` |
| Modular backend API | `backend/app/api/translation_routes.py` |
| Modular backend domain/model | `backend/app/services/translation_service.py`, `backend/app/models/model_config.py`, `backend/app/models/model_loader.py` |
| Modular backend schemas/utils | `backend/app/schemas/translation_schema.py`, `backend/app/utils/preprocessing.py`, `backend/app/utils/validation.py` |
| Legacy backend entry | `backend/main.py` |
| Legacy backend support | `backend/translator.py`, `backend/nlp_utils.py`, `backend/schemas.py` |
| Backend packaging/tests | `backend/Dockerfile`, `backend/requirements.txt`, `backend/.env.example`, `backend/test_backend.py` |
| ML configuration/data | `ml/config.py`, `ml/data/`, `ml/adapters/`, `ml/outputs/` |
| ML procedures | `ml/generate_sample_data.py`, `ml/data_cleaning.py`, `ml/back_translation.py`, `ml/train_lora.py`, `ml/evaluate.py`, `ml/push_to_hub.py`, `ml/requirements.txt` |
| CI/CD | `.github/workflows/build-apk.yml` |
| Existing docs | `docs/ARCHITECTURE.md`, `docs/SETUP.md`, `docs/RUBRIC_EVALUATION.md`, `frontend/README.md` |

## 2. Exact Tools, Frameworks, SDKs & Libraries

### 2.1 Frontend and Capacitor

Declared in `frontend/package.json`; resolved versions below are from
`frontend/package-lock.json` where present.

| Package/tool | Declared range | Lockfile version |
|---|---:|---:|
| React | `^18.3.1` | `18.3.1` |
| React DOM | `^18.3.1` | `18.3.1` |
| Vite | `^5.4.9` | `5.4.21` |
| `@vitejs/plugin-react` | `^4.3.3` | `4.3.4` |
| Tailwind CSS | `^3.4.14` | `3.4.17` |
| PostCSS | `^8.4.47` | `8.5.6` |
| Autoprefixer | `^10.4.20` | `10.4.21` |
| TypeScript | `^5.9.3` | `5.9.3` |
| `lucide-react` | `^0.453.0` | `0.453.0` |
| `clsx` | `^2.1.1` | `2.1.1` |
| `tailwind-merge` | `^2.5.4` | `2.5.4` |
| `@capacitor/core` | `^6.1.2` | `6.2.3` |
| `@capacitor/android` | `^6.2.3` | `6.2.3` |
| `@capacitor/network` | `^6.0.4` | `6.0.4` |
| `@capacitor/cli` | `^6.1.2` | `6.2.3` |

The active scripts are `dev` (`vite`), `build` (`vite build`), `preview`
(`vite preview`), `cap:sync` (`cap sync`), and `cap:android` (`cap open android`).
The Vite dev server is configured for port `3000`, host `true`, and output
directory `dist`. Tailwind scans `index.html` and `src/**/*.{js,ts,jsx,tsx}`.

UI/styling/behavior present in code:

- React 18 and React DOM.
- Tailwind/PostCSS configuration plus substantial CSS in `frontend/style.css` and
  `frontend/src/index.css`.
- `lucide-react` icons.
- Browser Clipboard API and Web Speech `speechSynthesis` in `TranslateView.jsx`.
- Google-hosted Inter and Noto Sans font URLs in `frontend/index.html`.
- Capacitor core and Network plugin. No other Capacitor plugin is declared.

`frontend/capacitor.config.json` sets `appId` to `ai.linguabridge.app`, app name
to `LinguaBridge AI`, `webDir` to `dist`, Android scheme to `https`, and
`cleartext: true`. The visible React branding and Android resource strings use
`Setu`, so the app-name values are inconsistent.

### 2.2 Android/native layer

- Android Gradle Plugin: `com.android.tools.build:gradle:8.2.1`.
- Google Services plugin declared at `4.4.0`, conditionally applied only if
  `frontend/android/app/google-services.json` exists. That file is
  `[NOT FOUND IN REPO]`.
- Gradle wrapper distribution: `gradle-8.2.1-all.zip`.
- Java source/target compatibility: Java 17 in generated
  `frontend/android/app/capacitor.build.gradle`.
- CI selects Temurin Java 21; local Java 17 is documented in `frontend/README.md`.
  The compatibility difference is `[UNVERIFIED]` as a source of build behavior.
- Android SDK: `compileSdkVersion 34`, `targetSdkVersion 34`, `minSdkVersion 22`.
- ABIs: `arm64-v8a` and `armeabi-v7a`.
- AndroidX versions are centralized in `variables.gradle`: AppCompat `1.6.1`,
  CoordinatorLayout `1.2.0`, Core SplashScreen `1.0.1`, Core `1.12.0`,
  Fragment `1.6.2`, Activity `1.8.0`, WebKit `1.9.0`.
- ONNX Runtime Android dependency: `com.microsoft.onnxruntime:onnxruntime-android:1.20.0`.
- Capacitor Android and Network modules are linked from `node_modules` by
  `capacitor.settings.gradle`.
- Native activity: `MainActivity` extends `BridgeActivity` and registers
  `NllbOfflinePlugin`.
- Native plugin: `NllbOfflinePlugin.java` loads `encoder_model_quantized.onnx`,
  `decoder_model_merged_quantized.onnx`, `tokenizer.json`,
  `sentencepiece.bpe.model`, and `config.json` from `assets/nllb/`; runs encoder
  and decoder ONNX sessions and returns `translatedText` and `latencyMs`.
- `AndroidManifest.xml` grants `INTERNET` and `ACCESS_NETWORK_STATE`, enables
  cleartext traffic, and sets `largeHeap=true`.
- `aaptOptions` and `androidResources` disable compression for `onnx`, `model`,
  and `json`.
- Local `frontend/android/app/src/main/assets/nllb/` model files are
  `[NOT FOUND IN REPO]`; `.gitignore` excludes that directory and `*.onnx`.
- No native model weights or Android APK are tracked. The CI workflow downloads
  the model files immediately before building.

### 2.3 Backend, NLP, and ML

Python requirements are minimum ranges, not pinned lockfiles:

| Manifest | Dependencies |
|---|---|
| `backend/requirements.txt` | FastAPI `>=0.109.0`, Uvicorn standard `>=0.27.0`, Pydantic `>=2.6.0`, pydantic-settings `>=2.1.0`, python-dotenv `>=1.0.0`, PyTorch `>=2.0.0`, Transformers `>=4.38.0`, PEFT `>=0.9.0`, SentencePiece `>=0.1.99`, Accelerate `>=0.27.0`, Hugging Face Hub `>=0.21.0`, SacreBLEU `>=2.4.0` |
| `ml/requirements.txt` | PyTorch, Transformers, PEFT, SacreBLEU, Datasets `>=2.17.0`, SentencePiece, Accelerate, scikit-learn `>=1.3.0`, Hugging Face Hub, tqdm `>=4.66.0`, pandas `>=2.0.0` |

The Dockerfile uses `python:3.10-slim`, installs build-essential/curl/git, runs
as UID 1000 user, exposes port 7860, and starts `uvicorn app.main:app`.
Python 3.10+ is documented; no `.python-version`, Poetry file, Pipfile, or
requirements lockfile is present `[NOT FOUND IN REPO]`.

Model identifiers and paths actually referenced:

- Base model: `facebook/nllb-200-distilled-600M`.
- Default LoRA Hub repository: `linguabridge-ai/nllb200-lora-eng-kan`.
- Local adapter: `ml/adapters/nllb_lora_bt` by configuration/default path.
- ML output metrics: `ml/outputs/metrics.json`.
- LoRA adapter metadata: rank `16`, alpha `32`, dropout `0.05`, target modules
  `q_proj`, `v_proj`, `k_proj`, `out_proj`, bias `none`.
- CI Android model source: `https://huggingface.co/Xenova/nllb-200-distilled-600M/resolve/main`
  for five ONNX/tokenizer/config assets.

NLP algorithms present in code include Unicode NFC normalization, whitespace
normalization, script-ratio checks for Latin/Kannada/Devanagari/Tamil/Telugu,
word/sentence tokenization, character n-grams, Levenshtein distance, WER,
repetition-loop detection, length-ratio filtering, greedy 1-4 gram lookup,
English stemming, and English SVO-to-Indic SOV reordering.

### 2.4 DevOps, CI, environment variables, and ignore rules

The sole workflow, `.github/workflows/build-apk.yml`, triggers on pushes to
`main`/`master` and manual dispatch. It uses `actions/checkout@v4`,
`actions/setup-node@v4` with Node 20 and npm cache,
`actions/setup-java@v4` with Temurin 21, `npm ci`, Vite build, Capacitor sync,
five `curl -fL` model downloads, Gradle `assembleDebug`, and
`actions/upload-artifact@v4`.

Environment names used by code/templates include:

- Frontend: `VITE_API_BASE_URL`; localStorage override
  `linguabridge_backend_url`.
- Backend/model: `PORT`, `DEBUG`, `CORS_ORIGINS` (documented but not read by
  either visible CORS configuration), `BASE_MODEL_NAME`, `HF_LORA_REPO_ID`,
  `HF_TOKEN`, `LOCAL_ADAPTER_DIR`, `METRICS_FILE_PATH`, `DEVICE`, `USE_FP16`,
  `MAX_INPUT_CHARS`, `MIN_INPUT_CHARS`, `MAX_GENERATION_LENGTH`,
  `DEFAULT_BEAM_SIZE`, `TRANSLATION_TIMEOUT_SECONDS`.
- ML publishing: `HF_TOKEN`.
- CI secret: `VITE_API_BASE_URL`.

`.gitignore` excludes environment files except `.env.example`, Node/build output,
Python caches/virtual environments, ML weight formats/checkpoints, Android build
output and generated Capacitor files, ONNX assets, APK/AAB files, IDE files, and
OS junk.

## 3. Step-by-Step Implementation Procedure

### 3.1 Project setup, branding, and UI

1. Install frontend dependencies with `npm ci` (or `npm install` as documented).
2. Vite reads `frontend/vite.config.js`, applies the React plugin, and emits
   `frontend/dist/`.
3. `frontend/index.html` mounts `src/main.jsx`; the active React tree renders
   `App.jsx`.
4. `App.jsx` provides Home and History views plus a translator view reached by the
   Home CTA. The visual brand is `Setu`; older files and storage keys retain
   `LinguaBridge`.
5. `TranslateView.jsx` provides source/target selectors, swap, input limit
   display, speech, clear, copy, output, and Translate controls.
6. `HistoryView.jsx` filters local history by source/translation/language text and
   can clear or restore a saved item.
7. `useTranslation.js` owns input/output/language/model/mode/error/history state.
   Several comparison/metrics/modal states are implemented in the hook but are
   not rendered by the active `App.jsx`/`TranslateView.jsx` UI `[UNVERIFIED as
   intended product behavior]`.

### 3.2 Text preprocessing and translation execution

1. `useNetwork.js` uses `@capacitor/network` on native platforms and
   `navigator.onLine` plus browser events on web.
2. When source language is `auto`, `detectScript()` maps Latin, Kannada,
   Devanagari, Tamil, or Telugu to canonical NLLB codes; unknown text defaults
   to English.
3. On native Capacitor, `translationApi.js` first invokes `NllbOfflinePlugin`.
   The plugin copies assets into app-private storage, tokenizes, executes ONNX,
   greedily selects decoder tokens, and decodes the vocabulary.
4. On web, or after native plugin failure, the client checks the local cache.
5. When online, it posts to `/api/translate`. The selected backend validates
   text/language/model variant, normalizes NFC/whitespace, invokes NLLB with up
   to four effective beams, and returns a typed response.
6. The modular service additionally checks elapsed inference time against
   `TRANSLATION_TIMEOUT_SECONDS`; the legacy engine has its own fallback and
   loading behavior.
7. If the online request fails or times out, the frontend returns a cache hit or
   invokes the pure JavaScript NLP engine. This is a client fallback, not a
   neural model.
8. The JavaScript fallback checks exact corpus phrases, tokenizes, tries longest
   n-grams, applies English typo correction and stemming, preserves unknown
   tokens, and optionally reorders English SVO into Indic SOV.

### 3.3 State, caching, history, and errors

- Translation cache key: lowercase trimmed source language, target language, and
  text; maximum 100 entries in `localStorage` key
  `linguabridge_translation_cache`.
- History key: `linguabridge_translation_history`; maximum 30 entries.
- Cache/history JSON parse and storage failures are logged with `console.warn`
  and use empty/default state.
- Successful backend, native, and offline results are cached.
- Frontend backend failures are logged and converted to fallback results; a
  visible error is used for UI-level failures such as comparison exceptions.
- Backend custom exceptions return structured error payloads; a broad 500 handler
  logs unhandled exceptions and exposes exception type/string in the response.
- Metrics are loaded on hook mount but the active UI does not render the metrics
  modal state.
- Backend `/api/compare` executes baseline, LoRA, and LoRA+BT sequentially and
  returns hardcoded benchmark metadata from service code.

### 3.4 ML data/training procedure

1. `ml/generate_sample_data.py` can create the checked-in-style seed corpus and
   Kannada monolingual text.
2. `ml/data_cleaning.py` normalizes NFC, deduplicates, validates source/target
   script ratios and length ratios, then uses seed 42 for an 80/10/10 split.
3. `ml/back_translation.py` loads NLLB, translates Kannada to English with beam
   search, rejects empty/long/repetitive/non-Latin/corrupt pairs, and optionally
   merges valid synthetic pairs with training data.
4. `ml/train_lora.py` loads JSONL with Hugging Face Datasets, tokenizes source and
   target, applies PEFT LoRA to NLLB attention projections, trains with
   `Seq2SeqTrainer`, and saves adapter/tokenizer output.
5. `ml/evaluate.py` compares baseline, LoRA, and LoRA+BT using SacreBLEU and
   chrF++; `--dry_run` writes representative metrics without model inference.
6. `ml/push_to_hub.py` creates missing adapter metadata/model card scaffolding and
   uploads the adapter/tokenizer/card when Hub dependencies and credentials are
   available.

## 4. End-to-End Runtime and Build Workflows

### 4.1 Local development and web

The repository documents and/or implements these commands:

```powershell
# Install ML and backend dependencies from the repository root
python -m venv venv
.\venv\Scripts\activate
pip install -r ml\requirements.txt
pip install -r backend\requirements.txt

# Modular backend (the Docker/production-style implementation)
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Legacy backend (the command currently documented in docs/SETUP.md)
python -m uvicorn main:app --reload --port 8000

# Frontend
cd ..\frontend
Copy-Item .env.example .env
npm ci
npm run dev
```

The Vite server is configured at `http://localhost:3000`. The frontend API
resolution order is:

1. localStorage `linguabridge_backend_url`;
2. build-time `VITE_API_BASE_URL`;
3. hardcoded `http://localhost:8000`.

`frontend/.env.example` shows a local value of `http://localhost:7860` and a
Hugging Face value of `https://linguabridge-ai-backend.hf.space`. The backend
template defaults `PORT=7860`, while both Python entry points default local
execution to 8000. This is a documented configuration mismatch, not a resolved
runtime fact.

The backend endpoints implemented by both stacks are:

```text
GET  /
GET  /health
GET  /api/languages
POST /api/translate
POST /api/compare
GET  /api/metrics
GET  /docs
GET  /redoc
```

The exact response fields differ between the modular and legacy schemas; selecting
which backend is authoritative is required before treating them as one contract.

### 4.2 Android/Capacitor

```powershell
cd frontend
npm ci
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

On Unix-like CI, the repository workflow uses `chmod +x gradlew` and
`./gradlew assembleDebug`. Before Gradle, CI creates
`android/app/src/main/assets/nllb/` and downloads:

```text
encoder_model_quantized.onnx
decoder_model_merged_quantized.onnx
tokenizer.json
sentencepiece.bpe.model
config.json
```

The expected debug artifact is
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`. It is
`[NOT FOUND IN REPO]` in the inspected worktree.

`npx cap sync android` copies the current web build into generated Android
assets and updates plugin metadata. The checked-in generated Android project
already references Capacitor Android and Network modules, but the model assets
are intentionally supplied by CI rather than committed.

### 4.3 CI/CD

`.github/workflows/build-apk.yml` is the only workflow. It runs only on pushes
to `main`/`master` or manual dispatch; it does not build/test/deploy the backend,
run Python tests, run ML pipelines, or publish a web deployment. A successful CI
run is `[UNVERIFIED]` from repository contents; no workflow result is stored.

The workflow passes `VITE_API_BASE_URL` from the GitHub secret during the Vite
build. If that secret is absent, the resulting frontend build behavior is
`[UNVERIFIED]`.

## 5. Gaps, Mismatches, and Verification Checklist

### 5.1 Findings

1. **Two backend stacks:** `backend/app/main.py` and `backend/main.py` define
   overlapping endpoint sets with different schemas, loaders, defaults, and
   behavior. `backend/Dockerfile` selects the modular stack; `docs/SETUP.md`
   selects the legacy stack.
2. **Backend port mismatch:** modular/local defaults are 8000, Docker forces
   7860, backend `.env.example` sets 7860, and frontend `.env.example` comments
   local development as 7860 while the frontend API default is 8000.
3. **Docker context/path limitation:** the Dockerfile copies only `backend/app/`.
   It does not copy `ml/` or the local adapter/metrics files. The modular
   backend therefore cannot use those repository-relative local artifacts inside
   that image; its fallback behavior is what the code will use. This requires
   runtime verification.
4. **Model assets absent locally:** `frontend/android/app/src/main/assets/nllb/`
   has no checked-in model files. Android native ONNX translation cannot be
   verified from the repository snapshot without running the CI download step.
5. **No pinned Python environment:** both Python requirement files use minimum
   versions and there is no Python lockfile. Reproducible versions are
   `[UNVERIFIED]`.
6. **Branding mismatch:** the visible app and Android resources say `Setu`;
   Capacitor config, package name, storage keys, comments, and many docs say
   `LinguaBridge AI`.
7. **Stale legacy frontend:** `frontend/app.js` contains a separate DOM-based
   client, hardcodes `http://localhost:8000/api`, calls `/api/comparisons`
   (not implemented by either listed backend), and is not loaded by the active
   React `frontend/index.html`.
8. **Documentation drift:** `frontend/README.md` describes components such as
   `Navbar.jsx`, `LanguageSelector.jsx`, `TranslatorPanel.jsx`, and
   `MetricsModal.jsx` that are `[NOT FOUND IN REPO]`; the actual active components
   are `TranslateView.jsx` and `HistoryView.jsx`.
9. **Feature wiring gap:** the hook has model comparison/metrics/modal state, but
   the active UI does not expose the comparison or metrics controls described in
   comments/docs. Whether this is intentional is `[UNVERIFIED]`.
10. **Metrics provenance mismatch:** checked-in `ml/outputs/metrics.json` states
    `test_set_size: 2`, while docs and fallback values describe 350 or roughly
    3,500 pairs. The scores are present, but the repository does not establish
    that the displayed benchmark numbers came from the current checked-in test
    corpus.
11. **Adapter completeness:** `ml/adapters/nllb_lora_bt/adapter_config.json` and
    README are present, but adapter weight files are not tracked in the listed
    files. Successful LoRA loading is therefore `[UNVERIFIED]`.
12. **No successful build evidence:** no successful frontend build, Capacitor
    sync, backend startup, or Android APK result is recorded in repository files.
13. **CORS environment mismatch:** `CORS_ORIGINS` is documented in
    `backend/.env.example` but the visible applications use hardcoded origin
    arrays and do not read that variable.
14. **Generated/ignored artifacts:** `frontend/dist/` and generated Android
    assets exist in the current worktree but are ignored/generated; they are not
    part of the tracked source contract.

### 5.2 Exact verification commands

Run these from `C:\Users\Yashwanth\Desktop\NLP` after installing the relevant
dependencies:

```powershell
# Frontend production build
npm ci --prefix frontend
npm run build --prefix frontend

# Frontend preview (separate terminal)
npm run preview --prefix frontend

# Capacitor synchronization
Set-Location frontend
npx cap sync android

# Android debug APK (requires Android SDK/JDK/Gradle wrapper readiness)
Set-Location android
.\gradlew.bat assembleDebug
Test-Path .\app\build\outputs\apk\debug\app-debug.apk
Set-Location ..\..

# Modular backend startup and health check
python -m uvicorn app.main:app --app-dir backend --port 8000
# Separate terminal:
Invoke-RestMethod http://localhost:8000/health

# Legacy backend startup and health check
python -m uvicorn main:app --app-dir backend --port 8000
# Separate terminal:
Invoke-RestMethod http://localhost:8000/health

# Existing backend verification script (model/network dependent)
python backend\test_backend.py

# Python syntax-only validation without starting model inference
python -m compileall backend ml

# ML dry-run metric/schema path
python ml\evaluate.py --dry_run
```

The two backend startup commands are deliberately listed separately; they are
alternatives, not a single combined startup sequence. A real translation request
also requires the selected backend's model/tokenizer/adapters or its documented
fallback conditions. Any successful result from the commands above should be
recorded externally because no such result is present in this repository snapshot.

