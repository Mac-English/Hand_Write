# HandWrite AI — Personalized Handwriting Assignment Platform

> **"Your Assignments. Your Handwriting."**

HandWrite AI is a full-stack SaaS platform that empowers students to prepare, organize, review, format, and export authentic handwritten-style assignments based on handwriting samples they voluntarily provide.

---

## 1. Key Features

- **Personalized Handwriting Calibration**: Upload photos of your own handwritten notebook pages. Calibrate approximate baseline slant angle, ink tone, line height, and letter spacing.
- **Printable Calibration Sheet**: Pangram template ("The quick brown fox jumps over the lazy dog", numbers, punctuation) to calibrate stroke rhythm and pen pressure.
- **Document Processing & Multimodal OCR**: Upload lecture notes, PDF worksheets, or scanned textbook pages. Text is extracted with heading and question formatting preserved.
- **AI Assignment Drafting**: Google Gemini 3.8 Flash assists in drafting structured question-and-answer responses, short answers, laboratory reports, and essays.
- **Interactive Draft Refinement**: Toolbar controls to simplify phrasing, expand technical explanations, correct grammar, or edit text manually before rendering.
- **Multi-Paper Notebook Engine**: Real-time rendering on authentic paper backgrounds:
  - Classic ruled notebook paper with vertical red margin lines
  - Yellow legal pad with double margin rules
  - Engineering graph grid paper
  - Vintage warm cream ivory paper
  - Clean unruled white paper
- **Pagination & Multi-Page Flow**: Accurately computes character widths and line steps across A4 and US Letter page sizes, preventing text clipping, overlaps, or broken lines.
- **Student Header Block**: Automated Page 1 header with Student Name, Roll / ID, Course Subject, and Date.
- **Multilingual Support**: Full English (LTR) and Urdu (RTL) support featuring Google Noto Nastaliq Urdu typography.
- **Export Engine**:
  - High-resolution multi-page PDF generation via `jsPDF`
  - Individual Retina PNG page image downloads
- **Data Privacy & Row Level Security**: Student handwriting samples are strictly private. No shared public model training. Full Supabase PostgreSQL schema with RLS policies.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js & Express (`server.ts`) with Vite middleware integration
- **AI Engine**: Google Gemini API (`@google/genai` SDK using `gemini-3.8-flash`)
- **Database & Storage**: Supabase PostgreSQL with Row Level Security (RLS) & local workspace fallback
- **Document & Handwriting Engine**: Custom vector layout engine, HTML5 Canvas rendering, `jsPDF`

---

## 3. Project Structure

```
├── .env.example                               # Environment variable templates
├── index.html                                 # HTML entry point with Google Fonts
├── metadata.json                              # Applet metadata & server-side GenAI capability
├── package.json                               # Dependencies and build scripts
├── server.ts                                  # Express server with Gemini API proxy endpoints
├── src/
│   ├── App.tsx                                # Main application router and state coordinator
│   ├── main.tsx                               # React application root
│   ├── index.css                              # Tailwind CSS global styles
│   ├── types/
│   │   └── index.ts                           # Domain TypeScript interfaces
│   ├── engine/
│   │   └── handwritingEngine.ts               # Pagination, line wrapping, and paper geometry
│   ├── services/
│   │   ├── geminiService.ts                   # Client communication to server AI endpoints
│   │   ├── pdfService.ts                      # Multi-page PDF and PNG export service
│   │   ├── storageService.ts                  # Hybrid persistence (Supabase / Local Workspace)
│   │   └── supabaseClient.ts                  # Supabase SDK connector and status reporter
│   └── components/
│       ├── navbar/
│       │   └── Navbar.tsx                     # Top Bar Contract header
│       ├── landing/
│       │   └── LandingPage.tsx                # Hero with interactive preview, features, pricing
│       ├── dashboard/
│       │   └── DashboardView.tsx              # Student workspace metrics and recent assignments
│       ├── assignment/
│       │   ├── NewAssignmentWizard.tsx        # 7-Step assignment creation workflow
│       │   └── NotebookPagePreview.tsx        # Interactive SVG/CSS notebook paper renderer
│       ├── handwriting/
│       │   ├── HandwritingCalibrationSheet.tsx# Printable alphabet calibration template
│       │   ├── HandwritingOnboarding.tsx      # Step-by-step sample upload & vision calibration
│       │   └── HandwritingProfilesList.tsx    # Saved profiles management & inspect modal
│       ├── projects/
│       │   └── ProjectsList.tsx               # Assignment search, filter, rename, delete
│       ├── settings/
│       │   └── SettingsView.tsx               # Student preferences & Supabase setup guide
│       ├── legal/
│       │   ├── HelpFaq.tsx                    # Guides & FAQ accordion
│       │   ├── PrivacyPolicy.tsx              # Student privacy & non-training commitment
│       │   └── TermsOfService.tsx             # Academic integrity guidelines
│       └── auth/
│           └── AuthModal.tsx                  # Sign in, registration, password reset, demo login
└── supabase/
    └── migrations/
        └── 20261011_initial_schema.sql        # Database tables, RLS policies, indexes
```

---

## 4. Setup & Local Development

### Prerequisites
- Node.js 18+ or Node 20+
- An API Key from Google AI Studio (`GEMINI_API_KEY`)

### Installation

1. Clone or open the repository:
```bash
git clone <repository-url>
cd handwrite-ai
```

2. Install dependencies:
```bash
npm install
```

3. Configure Environment Variables:
Copy `.env.example` to `.env`:
```bash
GEMINI_API_KEY="your-gemini-api-key"
# Optional Supabase integration:
# VITE_SUPABASE_URL="https://your-project.supabase.co"
# VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

4. Start the Full-Stack Dev Server:
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

---

## 5. Supabase Database Setup & RLS

When deploying with a live Supabase backend:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste the contents of `supabase/migrations/20261011_initial_schema.sql` and run it.
4. This script automatically:
   - Creates the `profiles`, `handwriting_profiles`, `assignments`, `generated_documents`, and `usage_records` tables.
   - Sets up indexes for performant multi-tenant querying.
   - Enables **Row Level Security (RLS)** with policies guaranteeing that each user can only read, insert, update, and delete their own records.
5. Create three private storage buckets in Supabase Storage:
   - `handwriting-samples`
   - `assignment-materials`
   - `exported-documents`
6. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your deployment environment variables.

---

## 6. Manual Testing Checklist

| Test Case | Procedure | Expected Result |
| :--- | :--- | :--- |
| **1. Authentication** | Click "Sign In" -> "Continue as Demo Student (Alex Morgan)". | Logged in instantly to the dashboard with student records. |
| **2. Interactive Mockup** | On the homepage, switch fonts to "Patrick Hand" and paper to "Yellow Legal Pad". | Mockup updates typography, line rules, and margin lines in real time. |
| **3. Calibration Sheet** | Click "Calibration Template Sheet" in Help or Onboarding. | Printable template opens with pangrams, numerals, and upload instructions. |
| **4. Handwriting Profile** | In "My Handwriting", click "New Handwriting Profile", upload a sample, click "Analyze". | Gemini Vision estimates slant, line spacing, ink tone; renders test preview. |
| **5. Assignment Wizard** | Go to "New Assignment", step through details, materials, AI draft generation. | Generates structured draft; allows section simplification and expansion. |
| **6. Notebook Page Preview** | Advance to Step 6 of wizard, flip between pages, adjust zoom slider. | Page flips smoothly; line wrapping and margins remain aligned with paper rules. |
| **7. Multi-Page PDF Export** | In Step 7, click "Download Full PDF Document". | Multi-page PDF downloads with student header, ruled lines, red margin, and footer. |
| **8. Urdu RTL Rendering** | Change assignment language to "Urdu (اردو)". | Text direction switches to RTL with Noto Nastaliq Urdu styling. |
| **9. Data Isolation** | Go to "Settings" -> review Supabase database guide. | Explains RLS policies and provides SQL path for production isolation. |

---

## 7. Current Limitations & Roadmap

- **Version 1.0 (Current)**: Employs sample-calibrated typographic handwriting models (Caveat, Kalam, Patrick Hand, Homemade Apple, Sacramento, Noto Nastaliq Urdu) with organic baseline jitter, custom slant, and ruled notebook geometry.
- **Future Version 2.0**: Direct integration with personalized character stroke synthesis models (using SVG Bezier vector stroke capture).
- **Payment & Subscriptions**: Proposed pricing tiers (Free, Student Plus, Graduate Pro) are modeled in the UI. Payment gateway credentials (e.g. Stripe) will be plugged in prior to live billing.
