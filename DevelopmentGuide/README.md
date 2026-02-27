# NexHire Developer Guide

Welcome to the NexHire development documentation. This guide is split into modular sections to help you navigate the codebase efficiently.

## Navigation

- [Project Architecture Overview](#project-architecture-overview)
- [🏁 Getting Started](./Getting_Started.md) - How to run the project.
- [🗄️ Database Guide](./Database_Guide.md) - Schema, Views, Stored Procs, and CLR reference.
- [⚙️ Backend Development](./Backend_Development.md) - API creation, Auth, and RBAC.
- [🎨 Frontend Development](./Frontend_Development.md) - Components, Styling, and Feature addition.
- [📋 Rules & Checklists](./Rules_and_Checklists.md) - Mandatory steps for every feature.
- [🚀 Features Inventory](./Features_Inventory.md) - Full list of implemented functionality.

---

## Recent Additions

### Navigation Updates (Candidate Dashboard)
- **Profile Access:** Profile tab removed from sidebar navigation, now accessible via clicking the user card at the bottom of the sidebar
- **Notifications:** Notifications tab removed from sidebar, now accessible via Bell icon in header
- **Component:** `components/DashboardShell.jsx` - Added `onProfileClick` handler for user card

### Profile Management (Candidate Dashboard)
- **Location:** Candidate Dashboard → "Profile" tab
- **Backend:** `GET/PUT /api/candidates/profile`, `PUT /api/candidates/profile/consent`
- **Frontend:** `components/Candidate/ProfileManagement.jsx`
- **Features:** Basic profile editing (FullName, Location, YearsOfExperience, LinkedInURL, Timezone), Privacy & Consent management (DataProcessing, Marketing, Retention, ThirdPartySharing), Account info display

### Admin Consent Management (Admin Dashboard)
- **Location:** Admin Dashboard → "Consent" tab
- **Backend:** `GET /api/analytics/consent-status`
- **Frontend:** `components/Admin/ConsentManagement.jsx`
- **Table:** `ConsentManagement`
- **Features:** GDPR consent tracking with 3 statuses (Active, Expired, Revoked), candidate name join, consent type and expiry display

### Predictive Hiring Success (Recruiter Dashboard)
- **Location:** Recruiter Dashboard → "Hire Predictor" tab
- **Backend:** `POST /api/analytics/predict-hire-success`
- **Frontend:** `components/Recruiters/HireSuccessPredictor.jsx`
- **Stored Procedure:** `sp_PredictHireSuccess`
- **Features:** Rules-Based AI predicting success probability with factor breakdown (Skill Match 30%, Interview Score 30%, Experience 25%, Engagement 15%, Historical adjustment)

### Salary Transparency Analytics (Admin Dashboard)
- **Location:** Admin Dashboard → "Salary Transp" tab
- **Backend:** `GET /api/analytics/salary-transparency`
- **Frontend:** `components/Admin/SalaryTransparencyAnalytics.jsx`
- **View:** `vw_SalaryTransparency`
- **Features:** Pie chart distribution, bar chart comparison, impact percentage calculation, detailed job-level breakdown

### Career Path Simulator (Candidate Dashboard)
- **Location:** Candidate Dashboard → "Career Path" tab → "Simulate New Path" button
- **Backend:** `POST /api/candidates/career-path/simulate`
- **Frontend:** `components/Candidate/CareerPathSimulator.jsx`
- **Parent Component:** `components/Candidate/CareerPath.jsx`
- **Stored Procedure:** `sp_PredictCareerPath`
- **Features:** Role selection, timeline slider (6-60 months), probability display, salary increase projection, development plan
- **Design System:** Redesigned to follow NexHire Design System Guide - uses glass-card patterns, solid indigo-600 buttons, proper border radius and typography

### Referral Intelligence Dashboard
- **Location:** Recruiter Dashboard → "Referral Intel" tab
- **Backend:** `GET /api/recruiters/referral-intelligence`
- **Frontend:** `components/Recruiters/ReferralIntelligence.jsx`
- **Tables:** `ReferralNetwork`, `NetworkStrength`, `ReferralPerformance`
- **Seed Script:** `server/sql/seed_referral_data.sql`
- **Features:** 5 tabs - Overview (summary stats, outcome breakdown), Top Referrers (leaderboard), Recent Referrals (table), Network Analysis (connection strength), AI Suggestions (job-specific referral recommendations using sp_SuggestReferrals stored procedure)

### Referral AI Suggestions (NEW)
- **Location:** Referral Intelligence Dashboard → "AI Suggestions" tab
- **Backend:** `GET /api/recruiters/referral-suggestions/:jobId`
- **Frontend:** `components/Recruiters/ReferralIntelligence.jsx` (AI Suggestions tab)
- **Stored Procedure:** `sp_SuggestReferrals`
- **Features:** Job dropdown selector, AI-powered referral suggestions with quality scores, estimated success probability, potential referrals with fit scores and connection strengths

### Candidate Profile Modal
- **Location:** Talent Pool → "View Profile" button
- **Backend:** `GET /api/recruiters/candidate-profile/:candidateId`
- **Frontend:** `components/Recruiters/CandidateProfileModal.jsx`
- **Features:** 4 tabs (Overview, Skills, AI Insights, History), aggregates 12 data sources

### Candidate Ranking History
- **Location:** Candidate Profile Modal → "History" tab
- **Backend:** `GET /api/recruiters/ranking-history/:candidateId`, `POST /api/recruiters/ranking-history`
- **Frontend:** `components/Recruiters/RankingHistory.jsx`
- **Table:** `CandidateRankingHistory`
- **Stored Procedure:** `sp_SaveCandidateRanking`
- **Features:** Timeline view, line/bar charts, trend analysis (improving/declining/stable), score statistics

### Remote Work Analytics (Admin Dashboard)
- **Location:** Admin Dashboard → "Remote Work" tab
- **Backend:** `GET /api/analytics/remote-compatibility`
- **Frontend:** `components/Admin/RemoteWorkAnalytics.jsx`
- **View:** `vw_RemoteCompatibilityMatrix`
- **Features:** Summary stats (avg score, excellent/poor matches, overlap hours), role compatibility chart, candidate factor averages (workspace quality, timezone alignment, communication, distraction resistance, self motivation), match distribution, detailed assessment table

### Email Queue Manager (Admin Dashboard)
- **Location:** Admin Dashboard → "Email Queue" tab
- **Backend:** `GET/PUT/DELETE /api/maintenance/email-queue`, `POST /api/maintenance/email-queue/send-test`
- **Frontend:** `components/Admin/EmailQueueManager.jsx`
- **Table:** `EmailQueue`
- **Features:** Email notification queue management with stats (total, sent, pending), filters (status, type), data table with recipient, type, subject, status, created date, action buttons (retry, delete), and send test email functionality

---

## Project Architecture Overview

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
│           │   ├── ApplicationPipeline.jsx
│           │   ├── ScheduleInterviewModal.jsx
│           │   ├── JobMatchingView.jsx
│           │   ├── SkillMatrix.jsx
│           │   └── JobMatchingView.jsx
│           └── Candidate/
│               ├── CandidateApplications.jsx
│               ├── CandidateInterviews.jsx
│               ├── CandidateSkillsVerification.jsx
│               └── AssessmentTestingEngine.jsx
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
│       ├── interviews.js       ← /api/interviews
│       ├── assessments.js     ← /api/candidates/assessments
│       └── recruiters.js       ← /api/recruiters
└── ProjectResources/
    ├── RecruitmentDB_MasterScript.sql       ← Full DB creation script
    └── NexHire Features Dictionary - FeaturesList.tsv  ← All features, tables, procs & views
```

> **DB Engine:** SQL Server (RecruitmentDB) via Windows Authentication  
> **ORM:** None — raw T-SQL via `msnodesqlv8`  
> **Frontend framework:** React 18, Vite, Tailwind CSS, Axios, Lucide React icons
