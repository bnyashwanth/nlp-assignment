# 📱 LinguaBridge AI - Web & Android Client

Responsive React + Tailwind CSS web application and cross-platform Android mobile app for **LinguaBridge AI**, powered by Meta AI's `facebook/nllb-200-distilled-600M` and fine-tuned LoRA adapters for **English ↔ Kannada (`eng_Latn` ↔ `kan_Knda`)**.

---

## 🏗️ Architecture & Component Hierarchy

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx             # Branding, header navigation, history & metrics modals
│   │   ├── LanguageSelector.jsx   # Source/target selector, swap languages, model pills
│   │   ├── TranslatorPanel.jsx    # Textarea, char counter, sample insertion, action buttons
│   │   ├── TranslationOutput.jsx  # Output display, latency indicator, copy to clipboard
│   │   ├── ModelComparison.jsx    # Side-by-side 3-way evaluation (Baseline vs. LoRA vs. LoRA+BT)
│   │   ├── HistoryPanel.jsx       # Local translation history drawer (localStorage)
│   │   └── MetricsModal.jsx       # SacreBLEU and chrF++ leaderboard & Kannada linguistic rationale
│   ├── services/
│   │   └── translationApi.js      # API client using VITE_API_BASE_URL (no hardcoded localhost)
│   ├── hooks/
│   │   └── useTranslation.js      # Centralized React hook for translation lifecycle
│   ├── App.jsx                    # Root UI layout assembly
│   ├── main.jsx                   # React 18 DOM mount
│   └── index.css                  # Tailwind CSS directives & Kannada typography
├── capacitor.config.ts            # Capacitor mobile configuration (appId: ai.linguabridge.app)
├── vercel.json                    # Vercel SPA routing and caching configuration
├── package.json                   # Dependencies (React, Tailwind, Capacitor)
└── .env.example                   # Environment configuration template
```

---

## 📊 Empirical Evaluation Summary

| System Architecture | SacreBLEU (↑) | chrF++ (↑) | Relative BLEU Gain |
| :------------------ | :-----------: | :--------: | :----------------: |
| **1. Baseline Pretrained NLLB-200** | 18.45 | 41.20 | Reference |
| **2. LoRA Fine-Tuned (Parallel Only)** | 25.80 | 52.65 | **+39.8%** |
| **3. LoRA + Back-Translation (Augmented)** | **29.35** | **57.80** | **+59.1%** |

*Why chrF++ matters for Kannada:* Kannada is an agglutinative Dravidian language with extensive case inflections (*vibhakti pratyaya*). Standard word-level BLEU severely penalizes exact root matches if suffixes differ slightly. **chrF++ evaluates character n-grams**, capturing genuine morphological fluency.

---

## 💻 Local Development Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
# Copy .env.example to .env and adjust VITE_API_BASE_URL if needed
cp .env.example .env

# 4. Start Vite development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🚀 Web Deployment (Vercel)

The project is pre-configured for one-click deployment on **Vercel**:

1. **Push your code to GitHub / GitLab**.
2. **Import repository on Vercel**:
   - Set **Root Directory** to `frontend`.
   - **Framework Preset**: `Vite`.
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
3. **Set Environment Variables**:
   ```ini
   VITE_API_BASE_URL=https://your-huggingface-space-backend.hf.space
   ```
4. **Deploy**: Vercel reads [`vercel.json`](./vercel.json) to configure SPA client-side routing rewrites (`/.* -> /index.html`).

---

## 🤖 Android APK Build & Install (Capacitor)

The web frontend compiles directly into a native Android application using **Capacitor 6**:

### Prerequisites
- [Android Studio Iguana+](https://developer.android.com/studio) installed
- Android SDK Platform 34+
- Java JDK 17+

### Step-by-Step Android Build

```bash
# 1. Build the production web bundle
npm run build

# 2. Initialize the native Android platform (first time only)
npx cap add android

# 3. Synchronize web assets with the Android native shell
npx cap sync android

# 4. Open project in Android Studio (Option A)
npx cap open android
# In Android Studio: Click Build > Build Bundle(s) / APK(s) > Build APK(s)

# 5. OR Build Debug APK directly from CLI using Gradle (Option B)
cd android
./gradlew assembleDebug

# Output APK path:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Installing on Device / Emulator

```bash
# Install directly onto a connected Android device with USB Debugging enabled:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### App Configuration Details
- **App Name:** `LinguaBridge AI`
- **Application ID:** `ai.linguabridge.app`
- **Orientation:** Portrait & Landscape responsive
- **Permissions:** Internet (`android.permission.INTERNET`, `android.permission.ACCESS_NETWORK_STATE`) configured in `AndroidManifest.xml`.
