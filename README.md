# Adaptive Onboarding Engine (Hackathon Full-Stack Demo)

An AI-powered onboarding web app that:
1) extracts skills from a resume (PDF/DOCX upload or pasted text),
2) compares them with a role-based skill database (optionally refined by job description text),
3) generates a dependency-safe, personalized learning roadmap with a “reasoning trace” explaining why it was created.

## Features

- Resume & Job Description parsing (PDF/DOCX + text)
- Role selection + predefined skill database (`backend/data/skills.json`)
- Skill gap analysis (missing vs weak skills)
- Adaptive roadmap generator (dependency order, grouped into Basics/Intermediate/Advanced)
- Reasoning trace (“Why this roadmap is generated”)
- Frontend: React + Tailwind (Upload page + Dashboard timeline)
- Backend: Node.js + Express API routes:
  - `/api/upload-resume`
  - `/api/analyze`
  - `/api/generate-roadmap`
- Sample dataset integration (demo resumes + job descriptions)
- Optional MongoDB persistence (enabled only if `MONGODB_URI` is set)

## Folder Structure

- `backend/` (Express API)
  - `routes/` (API routes)
  - `controllers/` (route handlers)
  - `utils/` (resume parsing, skill extraction, gap analysis, roadmap generation)
  - `data/` (`skills.json`)
  - `models/` (MongoDB models, optional)
- `frontend/` (React UI)
  - `src/pages/` (`UploadPage`, `DashboardPage`)
  - `src/lib/` (API client)
  - `src/components/` (optional, kept minimal)
- `dataset/` (sample resume + job description texts for hackathon demo)

## Setup (Run Locally)

### 1. Prerequisites

- Node.js 18+ (tested with Node 24)
- npm

### 2. Environment variables

1. Copy `.env.example` to `backend/.env` (backend uses `dotenv` and loads from its working directory).
2. (Optional) You can also keep a copy of `.env` at the project root, but the backend must be able to read it for AI/Mongo settings.

Recommended flow:
- Backend: create `backend/.env` (or run with a root `.env` set so `dotenv` can find it).
- Frontend: during development, Vite proxies `/api` to the backend automatically, so you don't need `VITE_*` variables for the demo.

If you only want a demo without AI keys, keep `AI_PROVIDER=mock`.

### 3. Run backend

```bash
cd backend
npm install
npm run dev
```

Backend default URL:
- `http://localhost:5000`
- API base: `http://localhost:5000/api`

### 4. Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL:
- `http://localhost:5173`

## API Integration Guide

### `POST /api/upload-resume`

Uploads and parses a resume file (PDF/DOCX).

Request (multipart/form-data):
- `file` (field name): the uploaded PDF/DOCX

Response:
- `filename`
- `resumeText` (extracted raw text)
- `extractedPreview` (top detected skills)
- `experienceLevel`
- `inferredRole`

### `POST /api/analyze`

Computes extracted skills and skill gaps for the selected role.

Request body (JSON):
- `resumeText` (optional if using sample)
- `resumeSampleId` (optional; uses `dataset/sample_resumes.json`)
- `jobDescriptionText` (optional)
- `jobDescriptionSampleId` (optional; uses `dataset/sample_job_descriptions.json`)
- `role` (required for best results; one of:
  `Full Stack Developer`, `Frontend Developer`, `Backend Developer`, `Data Analyst`)

Response:
- `analysisId`
- `extractedSkills`
- `requiredSkills`
- `gaps.missingSkills` and `gaps.weakSkills`
- `reasoningTrace` (“why these gaps were detected”)

### `POST /api/generate-roadmap`

Generates the adaptive learning roadmap from an analysis.

Request body (JSON):
- `analysisId` (preferred)
- `role`
- `gaps` (missing/weak) (included by frontend; controller can also re-use stored analysis)

Response:
- `roadmap`: timeline steps (Basics/Intermediate/Advanced)
- `reasoningTrace`: “Why this roadmap is generated”

### Sample dataset endpoints

- `GET /api/samples/resumes` -> list of resume samples
- `GET /api/samples/resumes/:id` -> get a specific sample resume text
- `GET /api/samples/job-descriptions` -> list of JD samples
- `GET /api/samples/job-descriptions/:id` -> get a specific JD sample text

## AI Integration Notes

- By default, the backend uses heuristic skill matching against `backend/data/skills.json`.
- If you set `AI_PROVIDER=openai` and provide `OPENAI_API_KEY`, the backend will optionally enhance extraction using OpenAI (with a safe fallback if parsing fails).

## MongoDB (Optional)

- If `MONGODB_URI` is provided, analysis payloads are persisted via Mongoose.
- If not set, the app continues in in-memory mode (sufficient for hackathon demos).

## Demo Checklist (Hackathon)

1. Open the frontend.
2. Pick a role (e.g., `Full Stack Developer`).
3. Choose a sample resume (or upload PDF/DOCX, or paste text).
4. Click `Analyze & Generate Roadmap`.
5. Review:
   - extracted skills
   - missing/weak gaps
   - timeline roadmap
   - reasoning trace
