# GymOS (GYM-JAM) Core Guidelines

1. **Identity & Scope Lock**
   - You are working inside GymOS (GYM-JAM), a production-deployed fitness tracker. Before writing or changing anything, confirm which layer the task touches:
     - Frontend: React 19 + Vite, Tailwind v4, Lucide React, Framer Motion, Zustand, React Router v7, React Activity Calendar, Recharts, @dnd-kit, papaparse
     - Backend: Spring Boot 3.4.4 (Java 17), stateless JWT auth, BCrypt
     - Data: PostgreSQL 16 (prod, Render) / H2 (local), Flyway-managed migrations only
     - Infra: Render Blueprint (render.yaml) — Static Site + Docker Web Service + Managed DB
     - AI layer: multi-provider circuit breaker (Groq, Gemini, Mistral, Hugging Face)
   - Do not introduce a new library, framework, state manager, ORM, or hosting dependency without explicitly flagging it first and waiting for confirmation. No silent stack changes.

2. **Never Touch Without Explicit Instruction**
   - Flyway migration files that have already run in production. New schema changes = new migration file only, never edit an existing one.
   - render.yaml blueprint structure (service names, ports, health checks) unless the task is explicitly infra-related.
   - JWT secret handling, filter chain order, or BCrypt strength factor.
   - The AI Routing Service's failure-tracking/circuit-breaker thresholds — these were tuned deliberately.
   - The multi-stage Dockerfile's build → strip → Alpine runtime structure (memory-limit workaround for free tier).
   - If a task seems to require touching these, stop and ask for confirmation with a one-line explanation of why.

3. **Security Non-Negotiables**
   - No API keys, DB credentials, or JWT secrets ever hardcoded or logged — env vars only, and confirm .env / secrets stay out of git.
   - Every new backend endpoint must pass through the existing JWT filter unless it's explicitly meant to be public (e.g. auth endpoints), and if so, say so out loud.
   - Any new user input (CSV import via papaparse, exercise names, split names) must be validated/sanitized server-side, not just trusted from frontend.
   - Per-user database isolation must never be weakened — every query touching workout/user data must be scoped to the authenticated user.

4. **AI Provider Layer Rules**
   - New AI features must go through the existing Strategy Pattern / circuit breaker abstraction — never call Groq/Gemini/Mistral/HF/Claude directly from a new bypass path.
   - Respect existing 429/failure handling — don't add a provider call that skips the "open circuit → fallback" logic.
   - Cache-first behavior for YouTube video IDs must be preserved — no re-introducing uncached calls that burn API quota.

5. **Data & Migration Discipline**
   - Every schema change ships as a new Flyway migration with a sequential version number — never mutate schema directly against the running DB.
   - Local dev/testing uses H2; don't write code that only works against Postgres-specific syntax unless it's explicitly guarded or the H2 profile is updated to match.
   - CSV import/export via papaparse must round-trip cleanly — if you change the export shape, update the importer in the same task.

6. **Frontend Guardrails**
   - Global state changes go through Zustand stores — no new parallel state system (no Redux, no Context-as-store sneaking in).
   - Drag-and-drop reordering logic (@dnd-kit) is the single source of truth for exercise order — don't duplicate ordering logic elsewhere (e.g. re-sorting in a component that should just trust store order).
   - Chart/heatmap components (Recharts, React Activity Calendar) should receive pre-shaped data from a selector/hook, not raw API payloads, to keep components dumb and testable.

7. **Change Hygiene**
   - One concern per change. Don't bundle a styling tweak with a schema migration with an auth change.
   - Before finishing a task, state in plain language: what changed, which layer(s) it touched, and whether it required a new migration, new env var, or new dependency.
   - If a task's scope creeps beyond what was asked (e.g. "fix the chart" turns into "refactor the store"), pause and flag it instead of proceeding silently.

8. **Production-on-Render Guardrails (Live DB Included)**
   - The entire stack — frontend, backend, and the Postgres database — runs on Render in production. Treat every action as touching a live system with real user data, not a sandbox.
   - Never run a destructive or irreversible operation against the production DB — no DROP, no unguarded DELETE/TRUNCATE, no manual data fixes via a console connected to prod. Schema/data changes go through Flyway migrations only, tested against H2 or a local Postgres first.
   - Before any migration touching existing tables (renaming/dropping columns, changing types), require an explicit backward-compatible or backfill step — production data must survive the migration, not just the schema.
   - Never suggest or perform actions that could cause downtime on the free tier (e.g. changes that spike memory during build, since the multi-stage Docker build is already tuned to survive the free tier's limits) without flagging the risk first.
   - Render environment variables (DB credentials, JWT secret, AI provider keys, YouTube API key) are configured on the Render dashboard, not in code or render.yaml — never propose hardcoding them or committing a .env with real values.
   - The Managed Database's connection string/credentials are Render-managed and rotate/behave differently than local H2 — don't assume local DB behavior (auto-create schema, relaxed constraints) applies in prod.
   - Any change to render.yaml (service names, build/start commands, health check paths, DB plan) is high-risk because it can affect the live deploy pipeline directly — confirm explicitly before touching it.
   - Prefer changes that are safe to roll forward without a rollback plan; if a change isn't easily reversible in production, say so before proceeding.

9. **When Unsure**
   - Default to asking a single clarifying question rather than guessing on:
     - anything touching auth, secrets, or per-user data isolation
     - anything touching production schema or the Render blueprint
     - anything that would change the AI fallback order
