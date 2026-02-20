# DECISIONS.md

# Architecture Decision Records (ADR)

## [ADR-001] Security: Mandatory Parameterized Queries
- **Status**: Decided
- **Context**: The previous implementation used string interpolation, which is vulnerable to SQL injection.
- **Decision**: All database interactions via `mssql` must use tagged template literals or parameterized inputs.
- **Consequence**: Increased security profile; slightly more verbose code.

## [ADR-002] Styling: Tailwind v4 Adoption
- **Status**: Decided
- **Context**: Project started with Vite + Tailwind v4.
- **Decision**: Use Tailwind v4's new engine and CSS-first configuration for all components.
- **Consequence**: Future-proof styling; cleaner HTML.
