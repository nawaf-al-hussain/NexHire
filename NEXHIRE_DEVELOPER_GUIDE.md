# NexHire — Comprehensive Developer Guide

> **Last updated:** 2026-02-23 (Updated with Advanced Analytics Dashboard, Recruiter Dashboard tabs, Candidate Dashboard tabs)
> This is the single source of truth for building features in this project.

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Running the Project](#2-running-the-project)
3. [Database: SQL Server Schema Reference](#3-database-sql-server-schema-reference)
4. [How to Cross-Check the Schema Before Coding](#4-how-to-cross-check-the-schema-before-coding)
5. [Backend: How to Create a New API Endpoint](#5-backend-how-to-create-a-new-api-endpoint)
6. [Authentication & RBAC System](#6-authentication--rbac-system)
7. [Frontend: How to Add a New Feature](#7-frontend-how-to-add-a-new-feature)
8. [Stored Procedures — How to Call Them](#8-stored-procedures--how-to-call-them)
9. [Database Views — How to Query Them](#9-database-views--how-to-query-them)
10. [CLR Functions Reference](#10-clr-functions-reference)
11. [Complete List of Implemented Features](#11-complete-list-of-implemented-features)
12. [All Registered API Endpoints](#12-all-registered-api-endpoints)
13. [Frontend Component Inventory](#13-frontend-component-inventory)
14. [Critical Rules & Gotchas](#14-critical-rules--gotchas)

---

## 1. Project Architecture Overview

```
NexHire-Frontend/
├── client/                     ← React 18 + Vite frontend
│   └── src/
│       ├── apiConfig.js        ← Single source for API_BASE URL
│       ├── context/
│       │   ├── AuthContext.jsx ← Global user/session state
│       │   └── ThemeContext.jsx← Dark/light mode
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── RecruiterDashboard.jsx
│       │   └── CandidateDashboard.jsx
│       └── components/
│           ├── DashboardShell.jsx       ← Shared layout (sidebar, theme, logout)
│           ├── Jobs/
│           │   ├── JobList.jsx
│           │   ├── JobModal.jsx
│           │   ├── CandidateMatches.jsx
│           │   ├── ApplicationPipeline.jsx        ← NEW: Kanban pipeline
│           │   ├── ScheduleInterviewModal.jsx    ← NEW: Interview scheduling
│           │   ├── JobMatchingView.jsx
│           │   ├── SkillMatrix.jsx
│           │   └── JobMatchingView.jsx
│           └── Candidate/
│               ├── CandidateApplications.jsx
│               ├── CandidateInterviews.jsx
│               ├── CandidateSkillsVerification.jsx
│               └── AssessmentTestingEngine.jsx   ← NEW: Skill verification tests
├── server/                     ← Node.js + Express backend
│   ├── index.js                ← App entry: registers all routes
│   ├── db.js                   ← msnodesqlv8 SQL Server connection
│   ├── .env                    ← DB_CONNECTION_STRING (Windows Auth)
│   ├── middleware/
│   │   └── rbac.js             ← protect(), authorize(roleID) middleware
│   └── routes/
│       ├── auth.js             ← /api/auth
│       ├── users.js            ← /api/users
│       ├── jobs.js             ← /api/jobs
│       ├── skills.js           ← /api/skills
│       ├── applications.js     ← /api/applications
│       ├── candidates.js       ← /api/candidates
│       ├── analytics.js        ← /api/analytics
│       ├── maintenance.js      ← /api/maintenance
│       ├── interviews.js       ← /api/interviews          ← NEW
│       ├── assessments.js     ← /api/candidates/assessments ← NEW
│       └── recruiters.js       ← /api/recruiters         ← NEW
└── ProjectResources/
    ├── RecruitmentDB_MasterScript.sql       ← Full DB creation script
    └── NexHire Features Dictionary - FeaturesList.tsv  ← All features, tables, procs & views
```

> **DB Engine:** SQL Server (RecruitmentDB) via Windows Authentication  
> **ORM:** None — raw T-SQL via `msnodesqlv8`  
> **Frontend framework:** React 18, Vite, Tailwind CSS, Axios, Lucide React icons

---

## 2. Running the Project

### Backend
```bash
cd server
node index.js
# Runs on http://localhost:5000
```

### Frontend
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

### Check connection string
[.env](file:///c:/Users/Hp%20ENVY%20X360%202%20in%201/Desktop/NexHire-Frontend/server/.env) in `/server`:
```
DB_CONNECTION_STRING=Driver={SQL Server Native Client 11.0};Server=LAPTOP-XXXX\SQLEXPRESS;Database=RecruitmentDB;Trusted_Connection=Yes;
```
Adjust `Server=` to your machine name (run `SELECT @@SERVERNAME` in SSMS).

### Health check
```
GET http://localhost:5000/api/status
```

---

## 3. Database: SQL Server Schema Reference

### Core Tables (always reference these)

| Table | Purpose | Key Columns |
|---|---|---|
| `Users` | All system users | `UserID`, `Username`, `Email`, `PasswordHash`, `RoleID`, `IsActive` |
| `Roles` | Role definitions | `RoleID` (1=Admin, 2=Recruiter, 3=Candidate), `RoleName` |
| `Candidates` | Candidate profiles | `CandidateID`, `UserID`, `FullName`, `Location`, `YearsOfExperience`, `ResumeText`, `ExtractedSkills` |
| `Recruiters` | Recruiter profiles | `RecruiterID`, `UserID`, `Department` |
| `JobPostings` | Job listings | `JobID`, `JobTitle`, `Description`, `Location`, `MinExperience`, `Vacancies`, `IsActive`, `IsDeleted`, `CreatedBy` |
| `Skills` | Master skill list | `SkillID`, `SkillName` |
| `CandidateSkills` | Skills per candidate | `CandidateID`, `SkillID`, `ProficiencyLevel` (1–10) |
| `JobSkills` | Skills required per job | `JobID`, `SkillID`, `IsMandatory`, `MinProficiency` |
| `Applications` | Job applications | `ApplicationID`, `CandidateID`, `JobID`, `StatusID`, `AppliedDate`, `MatchScore`, `WithdrawalReason`, `IsDeleted` |
| `ApplicationStatus` | Status lookup | `StatusID` (1=Applied, 2=Screening, 3=Interview, 4=Hired, 5=Rejected, 6=Withdrawn) |
| `ApplicationStatusTransitions` | Valid state machine | Defines allowed status changes |
| `InterviewSchedules` | Scheduled interviews | `ScheduleID`, `ApplicationID`, `RecruiterID`, `InterviewStart`, `InterviewEnd`, `CandidateConfirmed` |
| `InterviewFeedback` | Interviewer scores | `FeedbackID`, `ApplicationID`, `InterviewerID`, `TechnicalScore`, `CommunicationScore`, `CultureFitScore`, `SentimentScore` |
| `AuditLog` | Change history | `AuditID`, `TableName`, `RecordID`, `Operation`, `OldValue`, `NewValue`, `ChangedBy`, `ChangedAt` |
| **NEW** `MicroAssessments` | Skill verification tests | `AssessmentID`, `SkillID`, `Title`, `Description`, `AssessmentType`, `TimeLimit`, `PassingScore`, `QuestionsCount`, `IsActive` |
| **NEW** `AssessmentAttempts` | Test attempt records | `AttemptID`, `CandidateID`, `AssessmentID`, `StartedAt`, `CompletedAt`, `Score`, `TimeSpentSeconds`, `IsPassed`, `Details` |
| **NEW** `SkillVerifications` | Verified skills | `VerificationID`, `CandidateID`, `SkillID`, `AssessmentID`, `VerificationMethod`, `VerificationScore`, `VerifiedAt`, `IsVerified` |

### Application Status State Machine

```
Applied(1) → Screening(2) → Interview(3) → Hired(4)
                    ↓               ↓
                Rejected(5)    Rejected(5)
Applied(1,2,3) → Withdrawn(6)
```

**Using sp_HireCandidate (not raw UPDATE)** when hiring — it handles UPDLOCK, HOLDLOCK and vacancy decrement atomically.

---

## 4. How to Cross-Check the Schema Before Coding

**Before implementing any feature, do these steps:**

### Step 1 — Check the Features Dictionary
Open `ProjectResources/NexHire Features Dictionary - FeaturesList.tsv`  
Search for the feature → check the `Tables`, `Procedures`, and `Views` columns. This tells you **exactly** what already exists in the DB.

### Step 2 — Verify in SSMS
```sql
-- List all tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME;

-- List columns in a specific table
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'YourTable';

-- List all stored procedures
SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE';

-- List all views
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS;

-- Inspect a view
SELECT TOP 5 * FROM vw_YourView;

-- Inspect a stored proc
EXEC sp_helptext 'sp_YourProc';
```

### Step 3 — Use the `query.js` helper (from project root)
Edit `query.js` and run `node query.js` from the `/server` directory to quickly test any SQL query:
```js
const { query, connectDB } = require('./server/db');
async function checkDB() {
    await connectDB();
    const result = await query("SELECT TOP 5 * FROM YourTable");
    console.log(result);
}
checkDB().then(() => process.exit());
```

---

## 5. Backend: How to Create a New API Endpoint

### Step 1 — Create or find the route file
All route files are in `server/routes/`. If it's a new domain, create a file:
```js
// server/routes/newfeature.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

module.exports = router;
```

### Step 2 — Add the endpoint

```js
// GET endpoint
router.get('/', protect, async (req, res) => {
    try {
        const rows = await query(`SELECT * FROM YourTable`);
        res.json(rows);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: "Failed to fetch data." });
    }
});

// POST endpoint with parameters (use ? placeholders — NOT string interpolation)
router.post('/', protect, authorize(2), async (req, res) => {
    const { field1, field2 } = req.body;
    const userID = req.user.UserID;
    try {
        await query(
            `INSERT INTO YourTable (Field1, Field2, CreatedBy) VALUES (?, ?, ?)`,
            [field1, field2, userID]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: "Failed to create." });
    }
});
```

> ⚠️ **ALWAYS use `?` placeholders** — never string-interpolate user input into SQL. Use `[param1, param2]` as the second arg to `query()`.

### Step 3 — Register in index.js
```js
// server/index.js
const newFeatureRoutes = require('./routes/newfeature');
app.use('/api/newfeature', newFeatureRoutes);
```

### Step 4 — OUTPUT clause for INSERT (to get identity back)
```js
const result = await query(`
    INSERT INTO YourTable (Col1, Col2)
    OUTPUT inserted.YourTableID
    VALUES (?, ?)
`, [val1, val2]);
const newId = result[0].YourTableID;
```

### Step 5 — Calling stored procedures
```js
await query(`EXEC sp_YourProc ?, ?`, [param1, param2]);
```

---

## 6. Authentication & RBAC System

### How auth works (dev mode)
- On login, user object `{ UserID, RoleID, Username, Email }` is stored in `localStorage` as `nexhire_user`
- `AuthContext.jsx` reads this and sets Axios default headers:
  - `x-user-id: <UserID>`
  - `x-user-role: <RoleID>`
- Every API request automatically includes these headers
- Backend `protect` middleware reads them from `req.headers['x-user-id']` and populates `req.user`

### Role IDs (always use these numbers)
| RoleID | Role | Access |
|---|---|---|
| 1 | Admin | Full access, user management, audit logs |
| 2 | Recruiter | Jobs, applications, interviews, analytics |
| 3 | Candidate | Own applications, skills, interviews |

### Protecting routes

```js
// Any logged-in user:
router.get('/route', protect, handler);

// Only admins:
router.get('/admin-only', protect, authorize(1), handler);

// Only recruiters:
router.post('/recruiter-only', protect, authorize(2), handler);

// Multiple roles:
router.get('/shared', protect, authorize([1, 2]), handler);
```

### Getting user identity in a route handler
```js
const userID = req.user.UserID;   // integer
const roleID = req.user.RoleID;   // 1, 2, or 3
```

### Getting RecruiterID from UserID (required for interview/analytics routes)
```js
const recruiterCheck = await query("SELECT RecruiterID FROM Recruiters WHERE UserID = ?", [userID]);
if (recruiterCheck.length === 0) return res.status(403).json({ error: "Not a recruiter." });
const recruiterId = recruiterCheck[0].RecruiterID;
```

### Getting CandidateID from UserID
```js
const candCheck = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
const candidateId = candCheck[0].CandidateID;
```

---

## 7. Frontend: How to Add a New Feature

### Step 1 — Use API_BASE (never hardcode URLs)
```js
import API_BASE from '../../apiConfig'; // Resolves to http://localhost:5000/api
import axios from 'axios';

const res = await axios.get(`${API_BASE}/yourroute`);
```

### Step 2 — Use AuthContext for the current user
```js
import { useAuth } from '../../context/AuthContext';
const { user } = useAuth(); // user.UserID, user.RoleID, user.Username
```

### Step 3 — Adding a tab to a dashboard
Each dashboard (`RecruiterDashboard`, `AdminDashboard`, `CandidateDashboard`) uses a navigation array and a `switch(activeTab)` pattern:

```jsx
// 1. Add the tab to nav
const recruiterNav = [
    { icon: IconName, label: 'New Tab', active: activeTab === 'New Tab', onClick: () => setActiveTab('New Tab') },
];

// 2. Add a case in renderMainContent()
case 'New Tab':
    return <YourComponent />;

// 3. Fetch data when tab is active
React.useEffect(() => {
    if (activeTab === 'New Tab') fetchYourData();
}, [activeTab]);
```

### Step 4 — State & data fetching pattern
```jsx
const [data, setData] = React.useState([]);
const [loading, setLoading] = React.useState(false);

const fetchData = async () => {
    setLoading(true);
    try {
        const res = await axios.get(`${API_BASE}/yourroute`);
        setData(res.data);
    } catch (err) {
        console.error("Fetch error:", err);
    } finally {
        setLoading(false);
    }
};
```

### Step 5 — Creating a modal component
Use the established modal pattern from `ScheduleInterviewModal.jsx` or `JobModal.jsx`:
- Fixed overlay with `z-[110]` or higher, `backdrop-blur`
- `isOpen` / `onClose` props
- `animate-in zoom-in` class for entrance
- All error states shown inline in the modal

### Step 6 — Styling conventions
- **Glass cards:** `className="glass-card rounded-[3rem] p-10"` (defined in `index.css`)
- **Theme-aware text:** `text-[var(--text-primary)]`, `text-[var(--text-muted)]`
- **Theme-aware backgrounds:** `bg-[var(--bg-primary)]`, `bg-[var(--bg-secondary)]`, `bg-[var(--bg-accent)]`
- **Borders:** `border-[var(--border-primary)]`
- **Labels:** always `text-[10px] font-black uppercase tracking-widest`
- **Icons:** from `lucide-react` only
- **Fonts:** system font stack via Tailwind defaults
- **NO inline colors** — always use CSS variables or Tailwind semantic classes

---

## 8. Stored Procedures — How to Call Them

All stored procedures in the DB can be called via `EXEC`:

```js
// No output
await query(`EXEC sp_UpdateApplicationStatus ?, ?`, [applicationId, newStatusId]);

// With output rows
const result = await query(`EXEC sp_AdvancedCandidateMatchingEnhanced ?`, [jobId]);
// result is an array of rows

// Hiring (concurrency-safe)
await query(`EXEC sp_HireCandidate ?`, [applicationId]);

// Application withdrawal
await query(`EXEC sp_WithdrawApplication ?, ?`, [applicationId, reason]);

// Archive old data (Admin)
await query(`EXEC sp_ArchiveOldData`);

// Anonymize archived candidates
await query(`EXEC sp_AnonymizeArchivedCandidates`);
```

### Key stored procedures

| Procedure | Purpose |
|---|---|
| `sp_AdvancedCandidateMatchingEnhanced` | Match candidates to a job (skill + experience scoring) |
| `sp_HireCandidate` | Hire candidate — atomic with UPDLOCK, decrements vacancies |
| `sp_UpdateApplicationStatus` | Move application through state machine (validates transitions) |
| `sp_WithdrawApplication` | Candidate withdraws an application with reason |
| `sp_AutoScreenApplicationEnhanced` | Rules-based automated screening |
| `sp_ArchiveOldData` | Archive jobs/applications older than threshold |
| `sp_AnonymizeArchivedCandidates` | GDPR anonymization on archived candidates |
| `sp_GenerateInterviewQuestions` | AI-rules-based question generation by role/skill |
| `sp_PredictGhostingRisk` | Anti-ghosting risk prediction for a candidate |
| `sp_GenerateNegotiationStrategy` | Salary negotiation coaching output |
| `sp_GenerateLearningPath` | Personalized learning path for skill gaps |
| `sp_PredictCareerPath` | Career path prediction |
| `sp_ScheduleInterviewWithTimezone` | CLR-enhanced timezone-aware interview scheduling |
| `sp_ConfirmInterview` | Candidate confirms interview attendance |
| `sp_FuzzySearchCandidates` | Levenshtein/JaroWinkler fuzzy name search |
| `sp_AwardGamificationPoints` | Award points/badges to candidate |
| `sp_PredictHireSuccess` | Predict hiring success probability |
| `sp_PredictOnboardingSuccess` | Onboarding success prediction |
| `sp_GetMaskedCandidateData` | Returns PII-masked data based on caller role |
| `sp_AutoRejectUnqualified` | Batch auto-reject under-experienced applicants |

---

## 9. Database Views — How to Query Them

Views expose pre-joined, computed data. Always prefer views over complex raw queries in routes.

```js
// Query a view directly
const rows = await query(`SELECT * FROM vw_ApplicationFunnel`);
const rows = await query(`SELECT * FROM vw_VacancyUtilization WHERE JobID = ?`, [jobId]);
```

### High-Priority Views (already used in the app)

| View | Used In | What it returns |
|---|---|---|
| `vw_ApplicationFunnel` | RecruiterDashboard analytics | Count per application status |
| `vw_VacancyUtilization` | RecruiterDashboard analytics | Filled vs total vacancies per job |
| `vw_SilentRejections` | RecruiterDashboard risk alerts | Applications inactive > 30 days |
| `vw_GhostingRiskDashboard` | RecruiterDashboard risk alerts | Candidates with high ghost risk |
| `vw_CandidateInterviews` | CandidateDashboard | Candidate's scheduled interviews |
| `vw_SkillVerificationStatus` | CandidateDashboard | Claimed vs verified skills |
| `vw_CandidateMatchScore` | CandidateMatches, matching engine | Match score per candidate per job |

### Admin Dashboard Advanced Analytics Views (Wired to Frontend)

| View | Admin Tab | Purpose |
|---|---|---|
| `vw_MarketIntelligenceDashboard` | Market Intel | Skill demand vs supply trends |
| `vw_DiversityAnalyticsFunnel` | Diversity | DEI funnel by demographic |
| `vw_SalaryTransparency` | Salary Transp | Transparency vs application volume |
| `vw_RemoteCompatibilityMatrix` | Remote Work | Timezone overlap for remote roles |
| `vw_CareerPathInsights` | Career Path | Candidate career progression data |
| `vw_ReferralIntelligence` | Referral Intel | Referral quality and outcomes |
| `vw_HiringBottlenecks` | Core Analytics | Which stage takes longest (CLR business days) |
| `vw_AverageTimeToHire` | Core Analytics | Overall time-to-hire metric |
| `vw_HireRatePerJob` | Core Analytics | Hire-to-application ratio per job |
| `vw_RecruiterPerformance` | Recruiter Perf | Interviews and hires per recruiter |
| `vw_InterviewScoreVsDecision` | Core Analytics | Do scores predict outcomes? (CLR correlation) |
| `vw_InterviewerConsistency` | Core Analytics | Interviewer bias detection (CLR std dev) |
| `vw_SkillGapAnalysis` | Core Analytics | Required vs available skills across pool |
| `vw_RejectionAnalysis` | Core Analytics | Top rejection reasons |
| `vw_CandidateEngagement` | Core Analytics | Interview confirmation rates |
| `vw_Bias_Location` / `vw_Bias_Experience` | Core Analytics | Bias detection analytics |

---

## 10. CLR Functions Reference

CLR functions are called directly inside T-SQL queries. They are **not** called from Node.js. They are used within stored procedures and views in the database.

| Category | Function | SQL Usage |
|---|---|---|
| **Security** | `HashPassword(pwd, salt)` | Used in login/registration procs |
| **Security** | `VerifyPassword(pwd, hash)` | Returns BIT — used in auth |
| **Security** | `GenerateSecureToken()` | Returns NVARCHAR — for session tokens |
| **Security** | `EncryptSensitiveData(text)` | AES-256 for PII fields |
| **NLP** | `ExtractSkills(resumeText)` | Returns `'skill:score,skill:score'` string |
| **NLP** | `CalculateSentiment(text)` | Returns FLOAT (-1 to +1) |
| **String** | `CosineSimilarity(a, b)` | Returns FLOAT (0–1), used in matching |
| **String** | `JaroWinklerSimilarity(a, b)` | Name fuzzy match |
| **String** | `LevenshteinDistance(a, b)` | Edit distance |
| **Date** | `CalculateBusinessDays(start, end)` | Returns INT (Mon–Fri only) |
| **Date** | `GetRelativeTime(dt)` | Returns "2 hours ago" style string |
| **Date** | `AddBusinessDays(dt, n)` | Adds n business days to a date |
| **Date** | `IsWithinWorkingHours(dt)` | Returns BIT |
| **Timezone** | `ConvertTimezone(dt, from, to)` | DATETIME-aware timezone convert |
| **Timezone** | `CalculateTimezoneOverlap(tz1, tz2)` | Returns INT hours overlap |
| **Email** | `ValidateEmail(email)` | Returns BIT (RFC-5322) |
| **Email** | `IsDisposableEmail(email)` | Returns BIT |
| **API** | `CallRESTApi(url, method, body)` | HTTP client — returns JSON |
| **Doc** | `ExtractTextFromPDF(bytes)` | Returns resume text from PDF binary |
| **Doc** | `ExtractTextFromDocx(bytes)` | Returns resume text from DOCX binary |
| **Stats** | `CorrelationCoefficient(vals1, vals2)` | Pearson correlation |
| **Stats** | `StandardDeviation(vals)` | Population std dev |
| **Stats** | `Percentile(vals, p)` | Returns percentile value |

---

## 11. Complete List of Implemented Features

### ✅ Core Database & RBAC
- Role-Based Access Control (Admin/Recruiter/Candidate roles)
- PBKDF2-SHA256 password hashing via CLR
- Application state machine (6 states, enforced transitions)
- Concurrency-safe hiring (`sp_HireCandidate` with UPDLOCK)
- Soft delete on all major tables (`IsDeleted` flag)
- Automatic audit logging on all major table changes (AuditLog)
- Email notification queue (EmailQueue table, triggered)
- Instant auto-rejection trigger (`trg_InstantAutoReject`)
- Interview double-booking prevention (`trg_PreventDoubleBooking`)

### ✅ Job Management
- Create/Read/Delete job postings
- Required skills with proficiency levels and mandatory flags
- Vacancy tracking
- Soft archive of old job postings

### ✅ Candidate Matching Engine
- `sp_AdvancedCandidateMatchingEnhanced` — weighted skill + experience + location scoring
- CLR `CosineSimilarity` for semantic skill text matching
- Match score stored in `CandidateRankingHistory`
- Skill gap analysis in `CandidateMatches` UI

### ✅ Application Workflow
- Apply for jobs, check for duplicate applications
- Status progression: Applied → Screening → Interview → Hired/Rejected
- Candidate withdrawal with reason (`sp_WithdrawApplication`)
- Hire candidates atomically (vacancy decrement, status set)

### ✅ Interview Scheduling (NEW)
- `POST /api/interviews/schedule` — recruiter schedules interview
- `GET /api/interviews` — recruiter's interview list (upcoming + past)
- `GET /api/candidates/interviews` — candidate's interviews via `vw_CandidateInterviews`
- `ScheduleInterviewModal` in Application Pipeline
- "Interview Sch" tab on Recruiter Dashboard
- Full timezone-aware scheduling support

### ✅ Application Pipeline - Kanban (NEW)
- Visual Kanban board for application management
- Drag-and-drop style status transitions
- Stage-based filtering (Applied, Screening, Interview, Hired, Rejected)
- Per-candidate match scores displayed
- Quick actions: Advance stage, Schedule Interview, Finalize Hire, Reject

### ✅ Skill Verification & Assessments (NEW)
- **MicroAssessments table** - Skill tests with time limits and passing scores
- **AssessmentAttempts** - Track candidate test attempts
- **SkillVerifications** - Verified skills with scores
- `GET /api/candidates/assessments/available` - Fetch assessments for unverified skills
- `POST /api/candidates/assessments/start` - Start an assessment attempt
- `POST /api/candidates/assessments/submit` - Submit and score assessment
- **AssessmentTestingEngine** - React component for taking tests
- Timer countdown, auto-submit, pass/fail results
- Automatic skill verification on passing score

### ✅ Analytics (Recruiter)
- Hero stats (total candidate pool, top matches, open roles)
- Application funnel by stage
- Vacancy utilization
- Ghosting risk detection
- Silent rejection detector

### ✅ Recruiter Dashboard Extended Analytics (NEW)
- **Ghosting Risk** - Detailed ghosting risk data with risk scores
- **Skill Verify** - Skill verification status tracking
- **Time to Hire** - Individual candidate hiring timelines
- **Job Roles** - Active job postings management
- **Talent Pool** - Browse all candidates in the system
- **Job Matching** - Global matching engine UI
- **Interview Sch** - Interview schedule management (upcoming + past)
- **Video Interviews** - Video interview management
- **Hire Analytics** - Hiring metrics and trends
- **Insights** - Advanced analytics overview
- **Bias Detection** - Bias detection analytics

### ✅ Admin Dashboard
- Data archiving (old jobs/applications) — `sp_ArchiveOldData`
- GDPR anonymization — `sp_AnonymizeArchivedCandidates`
- Archive statistics view
- User management (`GET /api/users`, `PUT /api/users/:id/role`, `PUT /api/users/:id/status`)
- Security/Audit log viewer (`GET /api/analytics/audit-logs`)
- **Recruiter Performance** - Interview and hire metrics per recruiter
- **Consent Management** - GDPR consent tracking with expiry
- **Vacancy Utilization** - Job posting effectiveness overview

### ✅ Admin Dashboard Advanced Analytics (NEW)
- **Market Intelligence** - Skill demand vs supply trends via `vw_MarketIntelligenceDashboard`
- **Diversity Analytics** - DEI funnel by demographic via `vw_DiversityAnalyticsFunnel`
- **Salary Transparency** - Compensation benchmarks via `vw_SalaryTransparency`
- **Remote Work Compatibility** - Remote role fit scores via `vw_RemoteCompatibilityMatrix`
- **Career Path Insights** - Career progression data via `vw_CareerPathInsights`
- **Referral Intelligence** - Employee referral metrics via `vw_ReferralIntelligence`
- All 6 new tabs available in sidebar navigation with dedicated UI components

### ✅ Candidate Dashboard (NEW)
- **Discover Jobs** - Browse and search all active job postings
- **Applications** - View all submitted applications with status tracking
- **Interviews** - View scheduled interviews with confirmation
- **Skill Verify** - Take assessments to verify claimed skills
- **Career Path** - View career progression insights via `vw_CareerPathInsights`
- **Learning** - Personalized learning path recommendations via `sp_GenerateLearningPath`
- **Achievements** - Gamification leaderboard with points and badges
- **Interview Prep** - Personalized interview preparation materials
- **Salary Coach** - Market salary benchmarks and negotiation strategy
- **Resume Score** - Resume quality analysis with improvement tips
- **Location Prefs** - Location and work preference settings

### ✅ Career Development (NEW - Phases 1-3)
- **Career Path** - View career progression insights via `vw_CareerPathInsights`
- **Learning Paths** - Generate personalized learning recommendations via `sp_GenerateLearningPath`
- **Achievements (Leaderboard)** - Gamification with points, levels, badges from `CandidateGamification` table
- **Interview Prep** - Personalized interview preparation materials via `sp_GenerateInterviewPrep`
- **Salary Coach** - Market salary benchmarks and negotiation strategy via `sp_GenerateNegotiationStrategy`
- **Resume Score** - Resume quality analysis with improvement factors

### ✅ Job Matching UI
- Global `JobMatchingView` with ranked candidates per job
- `SkillMatrix` visualization component
- Skill gap displayed per candidate

### ✅ UI/UX System
- Dark/light theme toggle with `ThemeContext` + CSS variables
- Unified `DashboardShell` layout (sidebar, theme, logout)
- Glass card design system
- **Floating Chatbot** - AI assistant on all dashboards (bottom-right, purple gradient button)

---

## 12. All Registered API Endpoints

### Auth — `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login → returns user object |
| POST | `/api/auth/register` | Public | Register candidate |

### Users — `/api/users`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin (1) | All users with roles |
| PUT | `/api/users/:id/role` | Admin (1) | Update user role |
| PUT | `/api/users/:id/status` | Admin (1) | Toggle user active/inactive |

### Recruiters — `/api/recruiters`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/recruiters/talent-pool` | Recruiter (2) | Get all candidates with integrated insights |
| POST | `/api/recruiters/search` | Recruiter (2) | Fuzzy search candidates by name |

### Jobs — `/api/jobs`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/jobs` | Recruiter (2) | All active jobs |
| POST | `/api/jobs` | Recruiter (2) | Create job |
| DELETE | `/api/jobs/:id` | Recruiter (2) | Soft-delete job |
| GET | `/api/jobs/:id/applications` | Recruiter (2) | Applications for a job |
| GET | `/api/jobs/:id/matches` | Recruiter (2) | Matched candidates via matching engine |
| GET | `/api/jobs/public` | Public | Public job listings for candidates |

### Applications — `/api/applications`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/applications` | Candidate (3) | Apply for a job |
| PUT | `/api/applications/:id/status` | Recruiter (2) | Update application status |
| POST | `/api/applications/:id/hire` | Recruiter (2) | Hire candidate (uses sp_HireCandidate) |
| POST | `/api/applications/:id/withdraw` | Candidate (3) | Withdraw application |
| GET | `/api/applications/:id/history` | Any | Get application status history |

### Candidates — `/api/candidates`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/candidates/matches` | Candidate (3) | Get matched jobs with scores |
| GET | `/api/candidates/discover` | Candidate (3) | Discover all active jobs |
| GET | `/api/candidates/applications` | Candidate (3) | Own applications |
| GET | `/api/candidates/interviews` | Candidate (3) | Own interviews via view |
| GET | `/api/candidates/profile/skills` | Candidate (3) | Skill verification status |
| GET | `/api/candidates/skills` | Candidate (3) | Own skills |
| POST | `/api/candidates/confirm-interview` | Candidate (3) | Confirm interview attendance |
| POST | `/api/candidates/apply` | Candidate (3) | Apply for a job |
| POST | `/api/candidates/withdraw` | Candidate (3) | Withdraw application |
| POST | `/api/candidates/skills` | Candidate (3) | Add a skill |
| GET | `/api/candidates/assessments` | Candidate (3) | All available assessments |
| GET | `/api/candidates/assessments/available` | Candidate (3) | **NEW** Available skill assessments |
| POST | `/api/candidates/assessments/start` | Candidate (3) | **NEW** Start assessment attempt |
| POST | `/api/candidates/assessments/submit` | Candidate (3) | **NEW** Submit assessment |
| GET | `/api/candidates/career-path` | Candidate (3) | **NEW** Career path insights |
| GET/POST | `/api/candidates/learning-path` | Candidate (3) | **NEW** Learning path |
| GET | `/api/candidates/leaderboard` | Candidate (3) | **NEW** Gamification data |
| GET/POST | `/api/candidates/interview-prep` | Candidate (3) | **NEW** Interview prep |
| GET | `/api/candidates/salary-coach` | Candidate (3) | **NEW** Salary benchmarks |
| POST | `/api/candidates/salary-coach/negotiate` | Candidate (3) | **NEW** Negotiation strategy |
| GET | `/api/candidates/resume-score` | Candidate (3) | **NEW** Resume analysis |
| GET/POST | `/api/candidates/location-preferences` | Candidate (3) | **NEW** Location/work preferences |

### Skills — `/api/skills`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/skills` | Any | All skills from master Skills table |

### Analytics — `/api/analytics`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/analytics/stats` | Recruiter (2) | Hero stats |
| GET | `/api/analytics/funnel` | Recruiter (2) | Application funnel |
| GET | `/api/analytics/utilization` | Recruiter (2) | Vacancy utilization |
| GET | `/api/analytics/risk-alerts` | Recruiter (2) | Ghosting + silent rejection alerts |
| GET | `/api/analytics/audit-logs` | Admin (1) | AuditLog + username |
| GET | `/api/analytics/bias-detection` | Recruiter (2) | **NEW** Bias detection analytics |
| GET | `/api/analytics/time-to-hire` | Recruiter (2) | **NEW** Average time-to-hire metrics |
| GET | `/api/analytics/interview-scores` | Recruiter (2) | **NEW** Interview score vs decision |
| GET | `/api/analytics/interviewer-consistency` | Recruiter (2) | **NEW** Interviewer consistency metrics |
| GET | `/api/analytics/rejection-analysis` | Recruiter (2) | **NEW** Rejection reason analysis |
| GET | `/api/analytics/skill-gap` | Recruiter (2) | **NEW** Skill gap analysis |
| GET | `/api/analytics/candidate-engagement` | Recruiter (2) | **NEW** Candidate engagement scoring |
| GET | `/api/analytics/ghosting-detail` | Recruiter (2) | **NEW** Detailed ghosting risk data |
| GET | `/api/analytics/skill-verification` | Recruiter (2) | **NEW** Skill verification status |
| GET | `/api/analytics/time-to-hire-detail` | Recruiter (2) | **NEW** Individual time-to-hire metrics |
| GET | `/api/analytics/recruiter-performance` | Admin (1) | **NEW** Recruiter performance metrics |
| GET | `/api/analytics/consent-status` | Admin (1) | **NEW** GDPR consent status |
| GET | `/api/analytics/vacancy-overview` | Admin (1) | **NEW** Vacancy utilization overview |
| GET | `/api/analytics/per-job` | Recruiter (2) | **NEW** Hire rates per job |
| GET | `/api/analytics/bottlenecks` | Recruiter (2) | **NEW** Hiring bottleneck metrics |
| GET | `/api/analytics/diversity` | Public | Diversity analytics funnel |
| GET | `/api/analytics/market` | Public | Market intelligence dashboard |
| GET | `/api/analytics/salary-transparency` | Public | **NEW** Salary transparency analytics |
| GET | `/api/analytics/remote-compatibility` | Public | **NEW** Remote work compatibility |
| GET | `/api/analytics/career-path` | Public | **NEW** Career path insights |
| GET | `/api/analytics/referral-intelligence` | Public | **NEW** Referral intelligence |

### Interviews — `/api/interviews` (NEW)
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/interviews/schedule` | Recruiter (2) | Schedule an interview |
| GET | `/api/interviews` | Recruiter (2) | All interviews for current recruiter |

### Maintenance — `/api/maintenance`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/maintenance/archive-stats` | Admin (1) | Archive table row counts |
| GET | `/api/maintenance/archive-jobs` | Admin (1) | Archived job records |
| GET | `/api/maintenance/archive-applications` | Admin (1) | Archived application records |
| POST | `/api/maintenance/archive` | Admin (1) | Run sp_ArchiveOldData |
| POST | `/api/maintenance/anonymize` | Admin (1) | Run sp_AnonymizeArchivedCandidates |
| POST | `/api/maintenance/consent-check` | Admin (1) | **NEW** Validate and revoke expired consent |

---

## 13. Frontend Component Inventory

| Component | File | Purpose |
|---|---|---|
| `DashboardShell` | `components/DashboardShell.jsx` | Shared sidebar + header + theme toggle |
| `JobList` | `components/Jobs/JobList.jsx` | Recruiter's job posting grid |
| `JobCard` | `components/Jobs/JobCard.jsx` | Individual job card component |
| `JobModal` | `components/Jobs/JobModal.jsx` | Create job modal |
| `CandidateMatches` | `components/Jobs/CandidateMatches.jsx` | Matched candidates per job + skill gap |
| `ApplicationPipeline` | `components/Jobs/ApplicationPipeline.jsx` | **NEW** Kanban pipeline for applications |
| `ScheduleInterviewModal` | `components/Jobs/ScheduleInterviewModal.jsx` | **NEW** Schedule interview date/time picker |
| `JobMatchingView` | `components/Jobs/JobMatchingView.jsx` | Global matching engine UI |
| `SkillMatrix` | `components/Jobs/SkillMatrix.jsx` | Visual skill comparison matrix |
| `CandidateApplications` | `components/Candidate/CandidateApplications.jsx` | Candidate's own applications |
| `CandidateInterviews` | `components/Candidate/CandidateInterviews.jsx` | Candidate's scheduled interviews |
| `CandidateSkillsVerification` | `components/Candidate/CandidateSkillsVerification.jsx` | Skill verification status UI |
| `AssessmentTestingEngine` | `components/Candidate/AssessmentTestingEngine.jsx` | **NEW** Interactive assessment taking UI |
| `SkillManagementModal` | `components/Candidate/SkillManagementModal.jsx` | Add/remove skills from profile |
| `CareerPath` | `components/Candidate/CareerPath.jsx` | **NEW** Career progression insights |
| `LearningPaths` | `components/Candidate/LearningPaths.jsx` | **NEW** Personalized learning recommendations |
| `Leaderboard` | `components/Candidate/Leaderboard.jsx` | **NEW** Gamification & achievements |
| `InterviewPrep` | `components/Candidate/InterviewPrep.jsx` | **NEW** Interview preparation materials |
| `SalaryCoach` | `components/Candidate/SalaryCoach.jsx` | **NEW** Salary benchmarks & negotiation |
| `ResumeScore` | `components/Candidate/ResumeScore.jsx` | **NEW** Resume quality analysis |
| `RecruiterPerformanceAdmin` | `components/Admin/RecruiterPerformanceAdmin.jsx` | **NEW** Recruiter performance metrics |
| `ConsentManagement` | `components/Admin/ConsentManagement.jsx` | **NEW** GDPR consent tracking |
| `VacancyUtilizationAdmin` | `components/Admin/VacancyUtilizationAdmin.jsx` | **NEW** Vacancy utilization overview |
| `GhostingRiskDetail` | `components/Recruiters/GhostingRiskDetail.jsx` | **NEW** Ghosting risk detail |
| `SkillVerificationStatus` | `components/Recruiters/SkillVerificationStatus.jsx` | **NEW** Skill verification status |
| `TimeToHireDetail` | `components/Recruiters/TimeToHireDetail.jsx` | **NEW** Time to hire detail |
| `TalentPool` | `components/Recruiters/TalentPool.jsx` | **NEW** Talent pool management |
| `BiasAnalytics` | `components/Recruiters/BiasAnalytics.jsx` | **NEW** Bias detection analytics |
| `HireAnalytics` | `components/Recruiters/HireAnalytics.jsx` | **NEW** Hiring analytics overview |
| `AdvancedAnalytics` | `components/Recruiters/AdvancedAnalytics.jsx` | **NEW** Advanced analytics insights |
| `VideoInterviews` | `components/Recruiters/VideoInterviews.jsx` | **NEW** Video interview management |
| `LocationPreferences` | `components/Candidate/LocationPreferences.jsx` | **NEW** Location/work preference settings |

### Context Providers
| Component | File | Purpose |
|---|---|---|
| `AuthContext` | `context/AuthContext.jsx` | User authentication state & methods |
| `ThemeContext` | `context/ThemeContext.jsx` | Dark/light theme toggle |

### Page Components
| Component | File | Purpose |
|---|---|---|
| `LandingPage` | `pages/LandingPage.jsx` | Public landing page |
| `LoginPage` | `pages/LoginPage.jsx` | Login/registration page |
| `AdminDashboard` | `pages/AdminDashboard.jsx` | Admin dashboard with tabs |
| `RecruiterDashboard` | `pages/RecruiterDashboard.jsx` | Recruiter dashboard with tabs |
| `CandidateDashboard` | `pages/CandidateDashboard.jsx` | Candidate dashboard with tabs |

---

## 14. Critical Rules & Gotchas

### ⚠️ NEVER do this
```js
// WRONG — SQL injection risk
await query(`SELECT * FROM Users WHERE UserID = ${userID}`);

// CORRECT — parameterized
await query(`SELECT * FROM Users WHERE UserID = ?`, [userID]);
```

### ⚠️ Use `FullName` not `Name` in Applications JOIN
The application views return `FullName` from the `Candidates` table — not `Name`.

### ⚠️ `JobPostings` has `IsDeleted` — always filter it
```sql
SELECT * FROM JobPostings WHERE IsDeleted = 0 AND IsActive = 1
```

### ⚠️ Status IDs are integers, but stored as column
Map this in JS: `{ 1:'Applied', 2:'Screening', 3:'Interview', 4:'Hired', 5:'Rejected', 6:'Withdrawn' }`

### ⚠️ RoleID numbers must match
| RoleID | Role |
|---|---|
| 1 | Admin |
| 2 | Recruiter |
| 3 | Candidate |

### ⚠️ `authorize()` takes the RoleID number, not the name
```js
authorize(1)   // Admin only
authorize(2)   // Recruiter only
authorize([1,2]) // Admin OR Recruiter
```

### ⚠️ Always restart the server after changing routes
```bash
Get-Process node | Stop-Process -Force; node server/index.js
```

### ⚠️ The `Applications` table stores `CandidateID` not `UserID`
You must JOIN: `Applications → Candidates → Users` to get `UserID` from an application.

### ⚠️ `msnodesqlv8` uses `?` not `@param`
Other SQL Server drivers use named params — this one does not. Use positional `?`.

### ⚠️ `OUTPUT inserted.ID` must come before `VALUES`
```sql
INSERT INTO Table (Col) OUTPUT inserted.ID VALUES (?)
-- NOT after VALUES
```

### ⚠️ Adding new routes — register in index.js
A route file alone does nothing. You MUST add:
```js
const myRoutes = require('./routes/myroutes');
app.use('/api/myroutes', myRoutes);
```

### ⚠️ Frontend CSS — use CSS variables, not raw colors
The theme system relies on `--text-primary`, `--bg-primary`, etc. defined in `index.css`. Never use `text-gray-500` etc. directly or the dark mode will break.

### ⚠️ All modals need z-index > 100
The sidebar elements and overlays use `z-50`. Modals should use `z-[110]` or higher. Nested modals (modal-on-modal) use `z-[120]`.

### ⚠️ Assessment Testing Flow
When building assessment features:
1. `GET /api/candidates/assessments/available` returns MicroAssessments matching unverified claimed skills
2. `POST /start` creates an AssessmentAttempts record and returns AttemptID
3. Frontend shows AssessmentTestingEngine with timer
4. `POST /submit` calculates pass/fail and creates SkillVerifications record if passed

---

*This guide covers everything currently implemented. When adding any new feature, consult the Features Dictionary TSV first to see if the DB already has the table/proc/view you need.*
