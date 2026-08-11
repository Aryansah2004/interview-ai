# Interview AI

An AI-powered interview preparation platform. Upload your resume, paste a job description, and get a personalized interview strategy: a match score, likely technical and behavioral questions with model answers, your skill gaps, a day-by-day prep roadmap, and an AI-tailored resume PDF for that specific role.

Built as a full-stack MERN application with Google's Gemini API for AI generation.

---

## Features

- **Authentication** — register, login, logout, and a full forgot-password flow (identity verification + reset), with session persistence via JWT cookies
- **AI Interview Report Generation** — upload a resume (PDF) and paste a job description; the AI analyzes both and returns:
  - A match score (0–100)
  - Technical interview questions with intention and model answers
  - Behavioral interview questions with intention and model answers
  - Identified skill gaps with severity (low / medium / high)
  - A day-by-day preparation roadmap
- **Tailored Resume Download** — generates a resume PDF rewritten specifically for the target job description (not just reformatted — the AI decides what to emphasize)
- **Report History** — view every report you've generated, with match score and date
- **Progress Dashboard** — aggregate stats (average match score, best match, total reports), a match-score-over-time chart, and your most common recurring skill gaps across all reports
- **Robust error handling** — corrupted PDFs, unreadable/scanned PDFs, missing fields, and AI rate limits all fail gracefully with clear user-facing messages instead of crashes

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- SCSS
- Recharts (progress chart)
- lucide-react (icons)
- Axios

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication with httpOnly cookies + token blacklisting on logout
- bcryptjs (password hashing)
- Multer (file upload handling)
- pdf-parse (resume text extraction)
- Puppeteer (HTML → PDF rendering for tailored resumes)
- Google Gemini API (`@google/genai`) with structured JSON output

## Architecture

The frontend follows a layered structure per feature:

```
features/
  auth/
    pages/       — Login, Register, ForgotPassword
    hooks/       — useAuth (state + handlers)
    services/    — auth.api.js (HTTP calls)
    components/  — Protected (route guard)
  interview/
    pages/       — Home, Interview, Reports, Progress
    hooks/       — useInterview (state + handlers)
    services/    — interview.api.js (HTTP calls)
    style/       — SCSS per page
```

**UI → Hook → Service → API** — components stay presentational, hooks own loading/error state and expose handler functions, services own the raw HTTP calls. This keeps components easy to read and state logic reusable and testable independently of the UI.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- A Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))
- A Gmail account (only if using OTP-based password reset instead of the identity-verification flow)

### Backend

```bash
cd Backend
npm install
```

Create a `.env` file:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`, backend at `http://localhost:3000`.

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/logout` | Log out (blacklists token) |
| GET | `/api/auth/get-me` | Get current session user |
| POST | `/api/auth/forgot-password/verify` | Verify identity for password reset |
| POST | `/api/auth/forgot-password/reset` | Reset password |
| POST | `/api/interview/` | Generate a new interview report (multipart: resume + fields) |
| GET | `/api/interview/` | List all reports for the logged-in user |
| GET | `/api/interview/report/:id` | Get a single report |
| POST | `/api/interview/resume/pdf/:id` | Generate and download a tailored resume PDF |

## Key Engineering Decisions

- **Structured AI output** — early versions relied on prompt instructions alone to get JSON back from Gemini, which was unreliable (the model would return differently-shaped JSON, or wrap it in an array). Switched to defining the schema directly in Gemini's native `responseSchema` format (via `Type.OBJECT` / `Type.ARRAY`) instead of converting from a Zod schema, which fully eliminated shape mismatches.
- **PDF extraction guards** — resumes fail to parse for several real reasons (corrupted files, scanned images, custom-embedded fonts from design templates). The backend distinguishes between a parse exception (invalid file) and empty/insufficient extracted text (unreadable content), returning a specific, honest message for each rather than silently generating a report from empty input.
- **Rate limit handling** — Gemini's free-tier quota errors are caught specifically and surfaced as a friendly "try again shortly" message rather than a generic 500.
- **Tested against adversarial inputs** — the AI pipeline was validated against genuinely mismatched inputs (e.g. a personal trainer's resume against a software engineering job, or a resume/self-description/job description describing three different people) to observe and document how the model behaves under contradiction, not just on clean happy-path data.

## Known Limitations

- Password reset (non-OTP version) verifies identity by matching email + username rather than proving email ownership via a token/link — a known simplification, not a production-grade flow.
- No OCR fallback for scanned or image-based PDFs; these are currently rejected with a clear message rather than processed.
- The AI does not flag internal inconsistencies between resume, self-description, and job description — it will generate a plausible report even from contradictory inputs.

## License

This project is for educational/portfolio purposes.
