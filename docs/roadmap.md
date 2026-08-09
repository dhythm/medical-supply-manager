# Implementation roadmap

AI-based product registration is deferred. Features will be implemented in the following order.

1. PostgreSQL and Prisma foundation
2. Product catalog persistence, search, manual CRUD, and archiving
3. Database-backed dashboard metrics and review tasks
4. Customer feedback workflow
5. Group purchasing and price negotiation
6. Data governance and audit controls
7. Aggregated EMR usage imports

Each feature is developed with unit and PostgreSQL integration tests and committed independently.

## Database policy

- Local development and integration tests use PostgreSQL 17 in Docker Compose.
- Production uses a managed PostgreSQL service, not the development Compose database.
- Versioned migrations are committed and applied with `prisma migrate deploy`.
- Seed data is repeatable and contains no real patient, staff, or purchasing data.
- Money is stored as integer yen; identifiers such as GTIN and approval numbers are strings.
- Operational records are archived instead of physically deleted.
- All organization-owned records are queried through an organization scope.

## Phase gates

Before production deployment, backup restoration, migration rehearsal, access control, and audit-log retention must be verified against the managed PostgreSQL environment.
