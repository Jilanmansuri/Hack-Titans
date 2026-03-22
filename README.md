# SkillForge AI 

**SkillForge AI** is an AI-powered career growth platform that reads a user's resume or LinkedIn profile, finds missing skills for a target role, builds a personalized learning roadmap, and helps the user practice through an AI mock interview.

It is made for students, freshers, and job seekers who do not know **what to learn next**, **where they are lacking**, and **how to prepare smartly for interviews**.

---

## What is SkillForge AI?

Most onboarding and learning tools give generic advice.

**SkillForge AI** does something better:

It reads **YOUR** resume, finds **YOUR** exact skill gaps, builds **YOUR** personal roadmap, and then gives you an **AI mock interview based on the skills you are missing**.

### Simple Flow

**Upload Resume / Paste Text / Add LinkedIn URL → Select Target Role → Get Skill Analysis → View AI Roadmap → Practice Interview → Share Results**

---

## Problem Statement

Many students and early professionals want to move into roles like Frontend Developer, Backend Developer, Full Stack Developer, Data Analyst, or AI Engineer, but they face common problems:

- They do not know which skills they already have
- They do not know which skills are missing for a target role
- They follow random YouTube tutorials without a proper order
- They prepare for interviews in a generic way
- They do not get a clear roadmap based on their own profile

Because of this, people waste time, feel confused, and stay stuck.

---

## Our Solution

**SkillForge AI** solves this by combining resume analysis, skill-gap detection, roadmap generation, and AI interview practice in one platform.

The system:

- extracts skills from a resume or LinkedIn profile
- compares them with role-based requirements
- calculates the skill match
- shows gaps visually
- generates a week-by-week roadmap
- explains why that roadmap was created
- creates mock interview questions based on missing skills
- gives instant feedback and scoring

This makes career preparation clear, personal, and actionable.

---

## Key Features

### 🧠 AI Skill Extraction
Automatically detects **50+ technical skills** from uploaded resume files (**PDF/DOCX**) or pasted text using AI. No manual skill entry needed.

### 🎯 Skill Gap Analysis + Radar Chart
Compares extracted skills against role-specific requirements. A visual radar chart helps users quickly understand strengths and weak areas.

### 🗺️ Adaptive Roadmap Timeline
Builds a **dependency-safe**, week-by-week roadmap grouped into:

- Basics
- Intermediate
- Advanced

The roadmap is personalized according to the user’s current profile and target role.

### 💡 AI Reasoning Trace
Explains **why** the roadmap was built in that order. Users can see the dependency logic instead of getting a black-box answer.

### 🎤 AI Mock Interview Engine
Generates interview questions based on the user’s missing skills.  
This is not generic practice — it is targeted interview preparation.

It also gives feedback and scores on:

- Technical Understanding
- Communication
- Confidence

### 🔗 LinkedIn URL Extractor
Users can paste a LinkedIn profile URL and the system extracts skills using AI. A fallback flow is also supported if direct extraction is limited.

### 📤 Shareable Roadmap Card
Creates a visual summary card with:

- match score
- skill stats
- roadmap phases

Users can download it as PNG or share it.

### 🎨 Premium UI + Animations
The app includes:

- dark premium theme
- animated SVG branding
- smooth loading states
- animated skill pills
- radar chart transitions
- typewriter-style reasoning panel

---

## Why SkillForge AI is Different

Most tools only do one thing.

Some only read resumes.  
Some only suggest courses.  
Some only give interview questions.

**SkillForge AI combines the full journey in one place:**

- Analyze current profile
- Detect missing skills
- Build roadmap
- Explain roadmap
- Practice interview
- Share progress

This makes it useful, practical, and closer to a real product.

---

## Target Users

SkillForge AI is useful for:

- Students
- Freshers
- Final year graduates
- Career switchers
- Self-taught developers
- Job seekers preparing for technical roles

---

## Project Workflow

### Step 1: Upload Resume or Add LinkedIn URL
The user uploads a resume file or pastes a LinkedIn URL.

### Step 2: AI Extracts Skills
The backend parses the input and identifies technical skills.

### Step 3: Select Target Role
The user selects the role they want to prepare for.

### Step 4: Skill Gap Analysis
The system compares the user’s skills with the required skills for that role.

### Step 5: Visual Dashboard
The user sees:
- extracted skills
- missing skills
- match percentage
- radar chart

### Step 6: AI Roadmap Generation
A personalized roadmap is created with dependency-safe learning order.

### Step 7: AI Mock Interview
The user practices interview questions based on weak areas.

### Step 8: Share Results
The user generates a shareable roadmap card.

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS
- Chart/Radar visualization libraries

### Backend
- Node.js
- Express.js
- MongoDB (optional / extensible)
- File upload handling
- AI integration APIs

### AI / Intelligence Layer
- Claude AI for:
  - skill extraction
  - gap analysis
  - roadmap generation
  - reasoning trace
  - interview feedback

---

## Folder Structure

```bash
SkillForge-AI/
│
├── backend/                              # Express API Server
│   ├── controllers/                      # Route handlers
│   │   ├── analyzeController.js          # Skill extraction + gap analysis
│   │   ├── roadmapController.js          # Roadmap generation
│   │   ├── sampleController.js           # Sample data serving
│   │   └── uploadController.js           # Resume file upload + parsing
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   └── linkedinController.js     # LinkedIn URL skill extraction
│   │   └── routes/
│   │       ├── api.js                    # Main API routes
│   │       ├── interview.js              # Mock interview routes
│   │       └── linkedin.js               # LinkedIn routes
│   │
│   ├── data/
│   │   └── skills.json                   # Role-based skill database
│   │
│   ├── models/
│   │   └── Analysis.js                   # MongoDB model (optional)
│   │
│   ├── utils/                            # Helper utilities
│   ├── uploads/                          # Temp file storage
│   ├── server.js                         # Express app entry point
│   ├── .env                              # Environment variables
│   └── package.json
│
├── frontend/                             # React + Vite App
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── InterviewPanel.tsx        # AI Mock Interview UI
│   │   │   ├── LoadingOverlay.tsx        # Animated loading stages
│   │   │   ├── RadarChartComponent.tsx   # Skill gap radar chart
│   │   │   ├── ReasoningPanel.tsx        # AI reasoning trace
│   │   │   ├── RoleCard.tsx              # Role selection cards
│   │   │   ├── ShareModal.tsx            # Shareable roadmap card
│   │   │   ├── SkillPill.tsx             # Skill tag component
│   │   │   └── Timeline.tsx              # Roadmap timeline
│   │   │
│   │   ├── lib/
│   │   │   └── api.ts                    # API client + all fetch calls
│   │   │
│   │   ├── pages/                        # Page components
│   │   │   (UploadPage + DashboardPage)
│   │   │
│   │   ├── App.tsx                       # Root component + routing
│   │   ├── App.css
│   │   ├── index.css                     # Global styles + animations
│   │   └── main.tsx                      # React entry point
│   │
│   ├── index.html                        # App shell + tab title
│   ├── vite.config.ts                    # Vite + API proxy config
│   └── package.json
│
├── dataset/                              # Sample data for demo
│   (sample resumes + job descriptions)
│
├── .env.example                          # Environment template
└── README.md
