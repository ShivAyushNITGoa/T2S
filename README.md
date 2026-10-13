# Talk2Society (T2S) — Clean Modular Sovereign Ecosystem

A ground-up, cleanly architected TypeScript + React + Firebase Firestore platform for **Talk2Society (T2S)** by **A. K. Chandradipti**, replacing the original monolithic 17,000+ line codebase with a clean, modular, real-time PWA architecture ready for **Vercel** and **Firebase**.

---

## 🚀 Deploy on Vercel & Connect Firebase (Step-by-Step Guide)

### Step 1: Connect Your Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create or select your Firebase project.
2. **Enable Authentication (Google Sign-In)**:
   - Navigate to **Build → Authentication → Sign-in method**.
   - Enable **Google** as a Sign-in provider and save.
3. **Create Cloud Firestore Database**:
   - Navigate to **Build → Firestore Database** and click **Create database** (in Production mode).
   - Copy the rules from `firestore.rules` into the **Firestore → Rules** tab and click **Publish** (or run `firebase deploy --only firestore:rules`).
4. **Get Your Firebase Web App Config**:
   - Navigate to **Project Settings (⚙️) → General → Your apps → Web App (`</>`)**.
   - You can connect Firebase in either of two ways (both are supported automatically by `src/config/firebase.ts`):
     - **Option A (Recommended for Vercel)**: Add the environment variables from `.env.example` in **Vercel Dashboard → Project Settings → Environment Variables**:
       - `VITE_FIREBASE_API_KEY`
       - `VITE_FIREBASE_AUTH_DOMAIN`
       - `VITE_FIREBASE_PROJECT_ID`
       - `VITE_FIREBASE_STORAGE_BUCKET`
       - `VITE_FIREBASE_MESSAGING_SENDER_ID`
       - `VITE_FIREBASE_APP_ID`
       - `VITE_FIREBASE_MEASUREMENT_ID`
       - `VITE_FIRESTORE_DATABASE_ID` (optional, defaults to `(default)`)
     - **Option B**: Paste your Firebase keys directly into `firebase-applet-config.json`.

### Step 2: Deploy to Vercel
1. Push this repository to GitHub / GitLab / Bitbucket (or use the Vercel CLI: `npx vercel --prod`).
2. Import the repository in [Vercel](https://vercel.com/new):
   - **Framework Preset**: `Vite` (auto-detected via `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**.
4. **Authorize Your Vercel Domain in Firebase Auth**:
   - Once deployed, copy your Vercel domain (e.g., `your-app.vercel.app` or custom domain).
   - Go to **Firebase Console → Authentication → Settings → Authorized domains** and click **Add domain** to add your Vercel URL so Google Sign-In popups/redirects work in production.

---

## ✨ Key Architectural Highlights

1. **Full Bilingual Support (हिंदी `hi` & English `en`)**:
   - Dedicated `LanguageContext` (`src/context/LanguageContext.tsx`) and `<LanguageToggle />` (`src/components/common/LanguageToggle.tsx`) accessible from the **Gateway Header**, **Main Header**, and **Sidebar**.
   - Persists language selection in `localStorage` (`t2s_language`) and dynamically switches UI labels, titles, descriptions, navigation items, and modals between Hindi and English.

2. **Responsive Mobile & Desktop Navigation + Installable PWA**:
   - **Mobile (`< 1024px`)**: Fixed 7-button bottom navigation bar (`MobileBottomNav.tsx`), slide-out sidebar drawer (`Sidebar.tsx`), visible `← Back` buttons across Header, Sidebar, Bottom Bar, and Modals, plus Android/iOS hardware back gesture integration (`navHistory`).
   - **Desktop (`>= 1024px`)**: Sticky collapsible/expandable left sidebar (`Sidebar.tsx`) with `← Back` navigation in both Header and Sidebar.
   - **PWA Ready**: Includes `public/manifest.json`, `public/sw.js`, `src/utils/pwaInstall.ts`, and `vercel.json` headers for one-click installation on Android, iOS, Windows, macOS, and Linux.

3. **In-App Protected Media & Manuscript Readers (Zero External Redirects or Downloads)**:
   - All videos (`VideoDossierModal.tsx`, `JourneyModals.tsx`) and library books/PDFs (`BookReaderModal.tsx`, `BuiltInBookReader.tsx`) open strictly inside the app modal with download controls disabled (`controlsList="nodownload"`, `#toolbar=0&navpanes=0`, disabled context menus, and pop-out shields).

4. **Real-Time User & Admin Persistence on Firestore**:
   - **100-Day Journey (`src/data/journeyData.ts`)**: All 100 days intact, with real-time cloud sync for `completedDays`, `presenceDays`, `dailyReflections`, `xp`, `level`, and `streak`.
   - **Clean Zero-Demo Catalogs**: Video Archive, Library, and Shop start completely free of demo mode clutter and sync live with Firestore.
   - **Restricted Admin Command Center (`src/views/admin/`)**: Visible strictly to the designated administrator account, featuring full **Add, Edit, and Delete** across **100-Day Journey**, **Video Archives (with local device thumbnail upload)**, **Great Library (with local cover upload, in-app PDF links & interactive chapter editor)**, **Strategic Shop (with local image upload)**, **Community Forum**, and **Practitioner Directory**.

---

## 💻 Local Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Type-check with TypeScript
npm run lint

# Build production bundle for Vercel / Firebase Hosting
npm run build
```
