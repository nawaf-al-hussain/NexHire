# DECISIONS.md

# Architecture Decision Records (ADR)

## [ADR-001] Security: Mandatory Parameterized Queries
- **Status**: Decided
- **Context**: The previous implementation used string interpolation, which is vulnerable to SQL injection.
- **Decision**: All database interactions via `mssql` must use tagged template literals or parameterized inputs.
- **Consequence**: Increased security profile; slightly more verbose code.

## [ADR-003] Visualization: High-Fidelity Technical Fit Matrix
- **Status**: Decided
- **Context**: Recruiters need instant visual feedback on candidate-job skill alignment.
- **Decision**: Implement a `SkillMatrix` component that renders a grid of "Match vs. Gap" using emerald/rose themed glassmorphism indicators.
- **Consequence**: Dramatically reduced time-to-hire by highlighting missing mandatory skills immediately.

## [ADR-004] Data Lifecycle: Tiered T-SQL Archiving Strategy
- **Status**: Decided
- **Context**: GDPR compliance requires data anonymization and cold storage for old records.
- **Decision**: Trigger-based procedures (`sp_ArchiveOldData`) that move records from active tables to shadow tables before anonymization.
- **Consequence**: Clean production tables; bulletproof compliance audit trail.
