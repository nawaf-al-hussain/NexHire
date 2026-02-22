# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
NexHire is an elite, AI-driven recruitment ecosystem designed to automate the entire talent lifecycle. It transforms traditional hiring into a data-first "Command Center" (for Recruiters), a "Career Coach" (for Candidates), and an "Intelligence Suite" (for Admins). By leveraging deep SQL Server logic and 29+ C# CLR functions, NexHire provides sub-second intelligence on candidate-job compatibility, bias detection, and predictive hiring success.

## Goals
1. **Intelligent Automation**: Implement 97+ features including automated screening bots, anti-ghosting risk prediction, and instant auto-rejections.
2. **Deep Intelligence**: Utilize CLR-enhanced NLP for skill extraction, sentiment analysis, and weighted matching scores.
3. **Enterprise Compliance**: Ensure GDPR readiness through automated data masking, anonymization, and consent management.
4. **Premium Experience**: Deliver a high-performance, glassmorphic UI that provides real-time feedback and visualization.

## Non-Goals (Out of Scope)
- Building a custom video conferencing platform (will use integrations for Zoom/Teams).
- Implementing a full-scale Payroll system (focus remains strictly on Recruitment and Onboarding).

## Users
- **Administrators**: System controllers focused on DEI analytics, audit logs, and compliance.
- **Recruiters**: Power users managing job postings, matching talent, and scheduling interviews.
- **Candidates**: Job seekers using matching scores and skill gap analysis to find ideal roles.

## Constraints
- **Database**: Must use SQL Server with `msnodesqlv8` for Windows Authentication.
- **Performance**: Heavy database logic (CLR/Views) must not degrade frontend experience (UI must remain responsive).
- **Security**: All SQL calls must be parameterized to prevent injection.

## Success Criteria
- [x] Successfully implement and verify all 97 features documented in the Features Dictionary. [COMPLETED - VERIFIED IN DASHBOARDS]
- [ ] Achieve accurate skill extraction from PDF/Docx resumes using CLR functions. [PENDING]
- [x] Maintain a responsive UI (GSD standard) while executing complex weighted matching queries. [VERIFIED]
- [x] Pass all security audits for parameterized query implementation. [VERIFIED]
