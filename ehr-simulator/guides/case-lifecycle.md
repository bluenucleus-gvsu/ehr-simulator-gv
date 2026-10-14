# Case Session Lifecycle

This document is the source of truth for how a group's case session moves through its
lifecycle: what the terms mean, what triggers each state change, and how the
data model stores (or derives) each piece of state.

## 1. `case_sessions.status`

`case_sessions.status` is the authoritative lifecycle state of a simulation for
one group. It is **staff-controlled**: students may never write it directly
(student chart writes are gated by `assertStudentActiveSessionWrite`, and
status transitions live in `src/actions/simulation.ts`).

| Status | Meaning | Trigger | Timestamp |
|---|---|---|---|
| `assigned` | Session created, not yet started | DB triggers (`section_assignments_after_insert_create_case_sessions`, `groups_after_insert_create_case_sessions`) create one session per (section_assignment, group). App code never creates sessions. | — |
| `in progress` | A student has entered the active simulation | Student clicks "Enter Active Simulation" → `startSession` / `markSessionInProgress` (`src/actions/simulation.ts`) | `started_at` |
| `completed` | The simulation ran and was finished by staff | Staff clicks "Complete" (admin course view) → `completeAssignment` — a **bulk action on the section_assignment** that transitions every linked group session | `completed_at` |
| `archived` | The simulation window passed without completion, or staff archived it manually | Staff clicks "Archive" → `archiveAssignment` (bulk, per assignment), **or** lazily persisted by any read path that finds a non-terminal session past its archive window (see §2) | `archived_at` |

### Rules

- Staff Complete/Archive are **assignment-level bulk actions**: one click
  either archives or completes every `case_session` linked to that `section_assignment`.
- **Alignment invariant:** all sessions under one assignment share one
  lifecycle state. When completed and archived coexist (group backfilled after completion),
   **archived wins** — an assignment is only "completed" if every group completed.
- Staff bulk actions are **authoritative in both directions**: Complete
  overrides archived sessions (archived_at discarded); Archive overrides
  completed sessions (completed_at discarded).
- Aside from those explicit staff overrides, `completed` and `archived` are
  **terminal**: no transition may leave them.
  - `startSession` refuses `completed`/`archived` sessions.
  - Students cannot change status at all (write-gated in
    `assertStudentActiveSessionWrite`); `archived` sessions are read-only even
    if `started_at` is set.

## 2. Time-based state (derived on read; archival by scheduled job)

Pre-sim is **not** a DB status. It is derived from the `section_assignments`
schedule every time it is needed (`src/utils/assignedSimulationLifecycle.ts`):

| Derived state | Condition |
|---|---|
| Pre-sim | `now < presim_time` |
| Active (joinable) | `presim_time ≤ now ≤ sim_time + ARCHIVE_WINDOW_HOURS` |
| Past window (archive due) | `now > sim_time + ARCHIVE_WINDOW_HOURS` and status is not terminal |

- `ARCHIVE_WINDOW_HOURS = 24` is the single shared constant (mirrored by the
  `interval '24 hours'` in `archive_due_case_sessions()` — keep them in sync).
  After the scheduled sim time plus 24 hours, a session that is still
  `assigned` or `in progress` is considered past its window.
- **Scheduled archival:** a pg_cron job runs
  `public.archive_due_case_sessions()` every 15 minutes
  (`supabase/migrations/20261004120000_archive_due_case_sessions.sql`). It
  archives the **entire assignment** of any non-terminal session past its archive
  window. Staff can still archive early via the manual button.

## 3. Two-bucket display

Within a course, a student's sessions are grouped into exactly two buckets:

| Bucket | Contents | Purpose |
|---|---|---|
| **Active Sessions** | `assigned` + `in progress` sessions | What the student can/should work on now |
| **Past Sessions** | `completed` + `archived` sessions | History, with feedback |

All terminal and non-terminal sessions therefore always appear in exactly one
bucket. Inactive courses show only the Past Sessions bucket.

## 4. `section_assignments`

`section_assignments` is pure scheduling data (`presim_time`, `sim_time`,
`case_id`, `section_id`) and intentionally has **no status column**. Per-group
`case_sessions` are the unit of work.