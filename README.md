# Talk2Society (T2S) — Sovereign Community & 100-Day Transformation Platform

**Talk2Society (T2S)** is a full-stack, bilingual (**हिंदी & English**), Progressive Web Application (PWA) built for the **Talk2Society Community** to guide members through a structured **100-Day Self-Mastery & Strategic Transformation Journey**, interactive life-blueprint frameworks, curated video archives, digital manuscripts, wisdom journaling, and community collaboration.

---

## 👨‍💻 Developer & Author

- **Developed by**: **Ayush Kumar**
- **Academic Profile**: B.Tech in **Electrical and Electronics Engineering (EEE)** — **3rd Year, 5th Semester**
- **Institution**: **National Institute of Technology (NIT) Goa**
- **Platform & Community**: **Talk2Society (T2S)** (*A. K. Chandradipti*)

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.8, Vite 6 |
| **Styling & Motion** | Tailwind CSS v4 (`@tailwindcss/vite`), Motion (`framer-motion`), Lucide Icons |
| **Authentication** | Firebase Authentication (Google Sign-In OAuth 2.0) |
| **Database & Real-Time Sync** | Cloud Firestore (`onSnapshot` real-time listeners, server timestamps, multi-tab synchronization) |
| **Progressive Web App (PWA)** | Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Install Prompt API (Mobile & Desktop) |
| **Client-Side Document Engine** | HTML5 Canvas High-DPI Certificate Generator (PNG) & Native Multi-Page PDF 1.4 Generator (Wisdom Diary Export) |
| **Deployment & Hosting** | Vercel (Edge/Serverless configuration via `vercel.json`) & Firebase Security Rules (`firestore.rules`) |

---

## 📊 Data Architecture & Firestore Collections

The platform uses a real-time **Cloud Firestore** database synchronized with client state to ensure instant updates across devices and persistent progress across sessions:

| Collection / Document | Purpose & Data Model |
| :--- | :--- |
| **`users/{uid}`** | Stores member profile (`displayName`, `email`, `photoURL`), 100-Day progress (`completedDays`, `presenceDays`, `streak`, `lastCompletedAt`), gamification metrics (`xp`, `level`), Wisdom Log entries (`dailyReflections`), referral metrics, and Sovereign VIP pass status (`isStrategist`, `premiumRequestStatus`, `premiumRequestTransactionId`). |
| **`journey/day_{1..100}`** | Stores the 100-Day curriculum modules (`day`, `title`, `hindiTitle`, `lesson`, `task`, `category`, `videoUrl`, `youtubeEmbedId`, `isVip`) merged with the core 100-Day curriculum dataset (`src/data/journeyData.ts`). |
| **`archives/{videoId}`** | Curated community video dossiers with YouTube Embed ID support, custom local device thumbnails, categories, durations, and VIP access flags. |
| **`library/{bookId}`** | Digital manuscripts and books with custom cover artwork, structured multi-chapter readers, and protected in-app PDF streams (`order`, `chapters`, `pdfUrl`, `isVip`). |
| **`shop/{productId}`** | Strategic community resources and recommended tools (`name`, `price`, `category`, `platform`, `affiliateUrl`, `imageUrl`, `description`). |
| **`forum_posts/{postId}`** | Community Forum discussions, member insights, likes (`likedBy`), and nested replies (`replies`). |
| **`announcements/{id}`** | Real-time global broadcast banners pushed across all active community sessions. |
| **`settings/vip_gates`** | Dynamic section-level access configuration managed from the Admin Command Center. |

---

## ✨ Core Platform Features

1. **Bilingual Experience (हिंदी `hi` & English `en`)**
   - Instant language toggle across the entire platform—covering navigation, the 100-Day Journey, Blueprint guides, modals, certificates, and administrative tools.

2. **100-Day Transformation Journey (`src/views/JourneyView.tsx`)**
   - 100 structured daily lessons and actionable tasks across core life pillars (*Mental Clarity, Financial Strategy, Emotional Mastery, Physical Discipline, and Social Leadership*).
   - Enforces disciplined daily progression (one Journey day completion per calendar day) while keeping unreached future days locked.
   - Cloud-persisted XP, levels, daily streak tracking, and 30-day presence calendar.

3. **Simplified 5-Step Life Blueprint (`src/views/BlueprintView.tsx`)**
   - Beginner-friendly, bilingual interactive visual guide featuring:
     - **5 Simple Life Rules** (Mental Peace, Career & Money, Relationships, Health & Energy, Daily Routine)
     - **Interactive 3D Life Balance Visualizer** (`StickFigureVisualizer.tsx`)
     - **4 Life Stages Roadmap** (Age 15–22, 22–28, 28–35, 35+)
     - **Daily 24-Hour Practical Routine**
     - **5 Quick Self-Check Questions**

4. **Protected In-App Video Archives & Great Library (`src/views/ArchivesView.tsx`, `src/views/LibraryView.tsx`)**
   - **Video Dossier Modal**: Plays community sessions directly inside the app via YouTube Embed ID or direct stream without external redirects.
   - **In-App Manuscript & PDF Reader**: Reads multi-chapter books and PDFs strictly inside the app with dedicated full-screen mode and download protection.

5. **Wisdom Log & Multi-Page PDF Diary Export (`src/components/modals/ReflectionsJournalModal.tsx`)**
   - Members record daily reflections with voice-to-text dictation support and can export their complete personal diary as a formatted, multi-page A4 PDF document.

6. **Sovereign Milestone Certificates (`src/components/modals/SovereignCertificateModal.tsx`)**
   - Milestone certificates unlock progressively upon completing **Day 7**, **Day 21**, **Day 50**, and **Day 100**, generating a single high-resolution PNG certificate for mobile and desktop download.

7. **Responsive Mobile & Desktop PWA**
   - **Mobile**: Bottom navigation bar, slide-out navigation drawer, and hardware/in-app back navigation.
   - **Desktop**: Collapsible sidebar navigation with header breadcrumb controls and one-click PWA installation.

8. **Admin Command Center (`src/views/admin/`)**
   - Role-restricted management console for real-time curriculum editing, video archive publishing (with local thumbnail upload & YouTube Embed ID), library management, shop administration, broadcast announcements, and Sovereign VIP Pass (₹299 for the first 100 days) verification.

---

## 📁 Project Structure

```text
├── public/                  # PWA manifest, Service Worker, and Talk2Society brand assets
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI primitives, Logo, LanguageToggle, PresenceCalendar
│   │   ├── layout/          # Sidebar, Header, MobileBottomNav, BroadcastBanner, Notifications
│   │   └── modals/          # VideoDossier, BookReader, Certificate, WisdomLog, Ascension modals
│   ├── config/              # Firebase initialization & application constants
│   ├── context/             # AppContext (Firestore real-time state) & LanguageContext (HI/EN)
│   ├── data/                # 100-Day Journey dataset, Blueprint frameworks, and T2S metadata
│   ├── types/               # TypeScript interfaces for all domain models
│   ├── utils/               # Firestore sync helpers, media parsers, date utilities, PWA installer
│   └── views/               # Core application views, Blueprint visualizers, and Admin tabs
├── firestore.rules          # Cloud Firestore security rules
├── firebase.json            # Firebase configuration
├── vercel.json              # Vercel build, routing, and security header configuration
└── package.json             # Project dependencies and scripts
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (http://localhost:3000)
npm run dev

# 3. Run TypeScript type checking
npm run lint

# 4. Build for production
npm run build
```

---

## 🚀 Deployment (Vercel & Firebase)

1. **Firebase Setup**:
   - Enable **Google Sign-In** under **Firebase Console → Authentication → Sign-in method**.
   - Create a **Cloud Firestore** database and publish the rules in `firestore.rules`.
   - Configure your Firebase credentials via environment variables (`.env.example`) or `firebase-applet-config.json`.
2. **Vercel Deployment**:
   - Import the repository into [Vercel](https://vercel.com/new) (Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
   - Add your deployed Vercel domain under **Firebase Console → Authentication → Settings → Authorized domains**.
