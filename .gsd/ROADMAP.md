# ROADMAP.md

> **Current Phase**: Phase 1: Foundation
> **Milestone**: v1.0 (The Complete Ecosystem)

## Must-Haves (from SPEC)
- [ ] Core RBAC & Auth System
- [ ] Resume Parsing (CLR-enhanced)
- [ ] Weighted Matching Engine
- [ ] Automated Screening & Auto-Reject
- [ ] Analytics Dashboards (Funnel, Bias, Bottlenecks)

## Phases

### Phase 1: Foundation & Core Recruitment
**Status**: ✅ Completed
**Objective**: Establish secure connectivity and core recruitment workflows.
**Key Features**:
- Role-Based Access Control (RBAC) (REQ-89)
- User Provisioning & Secure Login (CLR-enhanced hashing) (REQ-70, 71, 108)
- Job Posting CRUD with Soft-Delete pattern (REQ-94)
- Basic Application workflow & State Machine validation (REQ-83, 85)
- Email Notification Queue (REQ-86)

### Phase 2: Intelligent Matching & Document Parsing
**Status**: 🔄 In-Progress
**Objective**: Implement the AI/NLP engine for candidate evaluation.
**Key Features**:
- CLR Resume Parsing (PDF/Docx text extraction) (REQ-61, 62) [PENDING]
- Skill Extraction & Years of Experience NLP (REQ-63, 67) [PENDING]
- Weighted Candidate Matching Engine (REQ-91) [COMPLETED]
- Skill Gap Analysis Radar & Matching Scores (REQ-51, 52) [COMPLETED]

### Phase 3: Skill Assessment & Testing Engine
**Status**: 🔄 In-Progress
**Objective**: Build a robust, in-app testing engine to verify candidate skills against the database architecture.
**Key Features**:
- MicroAssessment Hub (UI for candidates to view available skill tests matching claimed skills)
- Testing Engine UI (Time-limited question answering interface)
- Automated Verification Trigger (Writing to `AssessmentAttempts` and `SkillVerifications`)
- Multi-channel Notifications (Push + Email) (REQ-9, 20)

### Phase 4: Predictive Analytics & Performance
**Status**: ✅ Completed
**Objective**: Provide high-level intelligence for leadership and recruiters.
**Key Features**:
- Application Funnel & Hiring Bottleneck Detection (REQ-32, 39) [COMPLETED]
- DEI Bias Analytics (Location/Experience) (REQ-34, 36) [COMPLETED]
- Ghosting Risk Prediction & Silent Rejection Detection (REQ-2, 43) [COMPLETED]
- Recruiter Performance Leaderboards & Vacancy Utilization (REQ-41, 44) [COMPLETED]

### Phase 5: UI/UX Refinement & Theme System
**Status**: ✅ Completed
**Objective**: Modernize the interface with a premium, dynamic design system.
**Key Features**:
- Global Light/Dark Mode (ThemeContext) [COMPLETED]
- Premium Component Refactor (Landing, Dashboards) [COMPLETED]
- Responsive UI & Micro-animations [COMPLETED]

### Phase 6: Compliance & Advanced Maintenance
**Status**: ✅ Completed
**Objective**: Ensure enterprise-grade data handling and GDPR compliance.
**Key Features**:
- Automated Data Archiving Procedure (sp_ArchiveOldData) [COMPLETED]
- PII Anonymization & Consent Management [COMPLETED]
- Real-time Archive Statistics & Data Tables [COMPLETED]

### Phase 7: Advanced Visualization (Intelligence Matrix)
**Status**: ✅ Completed
**Objective**: Deliver high-fidelity visual insights for matching results.
**Key Features**:
- Technical Proficiency Matrix (SkillMatrix) [COMPLETED]
- Global Talent Synchronization (JobMatchingView) [COMPLETED]
- Real-time Match vs. Gap Analysis [COMPLETED]

### Phase 8: System Administration & Auditing
**Status**: ⬜ Not Started
**Objective**: Comprehensive control center for user management and compliance tracking.
**Key Features**:
- Global User Management (Enable/Disable accounts) 
- Role Configuration & Permissions assignment
- Real-time Audit Log View (Tracking access and actions)
