# Simulation phases — schema & compatibility contract

This document defines the **database shape**, **runtime resolution rules**, and **frontend NULL defaults** for multi-phase simulation. Case builder authoring is covered in [case-phases.md](./case-phases.md).

**Status:** Schema migration `20260601120000_case_phases.sql` is applied. Student chart **phase filtering and advance alerts** are implemented in `src/lib/simPhases.ts`, `SimulationCaseContext`, and `phaseAdvanceAlert.tsx`. Faculty advance button remains a separate workstream.

---

## 1. Design principles

| Principle | Rule |
|-----------|------|
| **Single-phase is the default** | `phase_count = 1`, `current_phase = 1`, all content rows `phase = 1`. Legacy cases behave exactly as before. |
| **No NULL semantics in prod** | Migrations use `NOT NULL DEFAULT 1`. Frontend still defensively coerces NULL/invalid API values. |
| **Phase-scoped vs shared** | **Orders, Labs, MAR** vary per phase. **Demographics, history, notes, charting, I/O** are shared across phases. |
| **Session owns “where we are”** | `case_sessions.current_phase` is the student group’s active phase during sim. |
| **Case owns “how many exist”** | `cases.phase_count` is the faculty-configured ceiling (1–10). |
| **Soft-hide orphan phases** | Rows with `phase > cases.phase_count` stay in DB (authoring); sim and faculty UI must **not** show them. |

---

## 2. Schema (already migrated)

### 2.1 `cases`

| Column | Type | Default | Notes |
|--------|------|---------|--------|
| `phase_count` | `integer NOT NULL` | `1` | Check: `1 <= phase_count <= 10` |

**Backwards compatibility:** Pre-migration cases receive `1` via default. No application code should assume the column is missing.

### 2.2 Phase-scoped content tables

| Table | Column | Type | Default | Notes |
|-------|--------|------|---------|--------|
| `orders` | `phase` | `integer NOT NULL` | `1` | Index: `(case_id, phase)` |
| `lab_results` | `phase` | `integer NOT NULL` | `1` | Unique: `(case_id, phase, time_offset)` |
| `medication_orders` | `phase` | `integer NOT NULL` | `1` | PK remains `id` (UUID per row; each phase has its own order rows) |
| `medication_administrations` | `phase` | `integer NOT NULL` | `1` | FK to `medication_orders(id)` |

**Backwards compatibility:** All legacy rows backfill to `phase = 1`. Sim without phase filtering still “works” but may **mix phases** if multi-phase content exists — sim **must** filter (see §4).

### 2.3 `case_sessions`

| Column | Type | Default | Notes |
|--------|------|---------|--------|
| `current_phase` | `integer NOT NULL` | `1` | Check: `current_phase >= 1` |

**Gap (optional follow-up migration):** Add `CHECK (current_phase <= …)` only via trigger that reads `cases.phase_count`, or enforce in application on `advanceSessionPhase`.

### 2.4 Tables unchanged by phase

Do **not** add `phase` to: `clinical_documents`, `documentation_results`, `case_*` history tables, `intake_output` blocks on `cases`, imaging/microbiology children except via parent `lab_results.phase`.

---

## 3. Optional schema follow-ups (SIM hardening)

Not required for v1 if app-layer enforcement is enough:

```sql
-- A. Audit when faculty advances a group
ALTER TABLE public.case_sessions
  ADD COLUMN IF NOT EXISTS phase_advanced_at timestamptz;

-- B. How sim merges content (product choice; default 'replace')
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS sim_phase_display_mode text NOT NULL DEFAULT 'replace'
  CHECK (sim_phase_display_mode IN ('replace', 'cumulative'));

-- C. Session phase cannot exceed case ceiling (trigger)
-- CREATE FUNCTION enforce_session_phase_ceiling() ...
```

| Addition | Purpose |
|----------|---------|
| `phase_advanced_at` | Faculty dashboard / analytics |
| `sim_phase_display_mode` | `replace` = only current phase; `cumulative` = phases `1..current_phase` merged |
| Trigger on `case_sessions` | DB guard: `current_phase <= cases.phase_count` |

---

## 4. Runtime data loading (SIM)

### 4.1 Resolve context at chart boot

```
effectivePhaseCount = coerce(cases.phase_count)     // default 1
effectiveCurrentPhase = coerce(case_sessions.current_phase, max=effectivePhaseCount)  // default 1
isMultiPhase = effectivePhaseCount > 1
```

Routes without a `case_sessions` row (e.g. `section_assignments` preview):

- Treat `current_phase` as **1**.
- Still respect `cases.phase_count` for faculty-only UI.

### 4.2 Per-section effective phase (implemented)

Authors may stop at different phases per tab (e.g. Orders through phase 2, Labs through phase 4). When the session is on **simulation phase 4**:

| Section | Content shown |
|---------|----------------|
| Orders | Latest authored **orders** phase where `phase <= 4` (e.g. phase 2 if 3–4 were never authored) |
| Labs | Latest authored **labs** phase `<= 4` |
| MAR orders | Latest authored **medication_orders** phase `<= 4` |
| MAR administrations | Latest authored **medication_administrations** phase `<= 4` (linked to orders from the med-orders effective phase) |

Implemented in `resolveEffectivePhases()` + `filterCaseBundleForSimulation()`.

### 4.3 `getCaseBundle` contract (optional server follow-up)

```ts
getCaseBundle(caseId: string, opts?: {
  /** If set, filter Orders/Labs/MAR to this phase only. */
  phase?: number;
  /** If true and phase > 1, merge phases 1..phase (requires sim_phase_display_mode). */
  cumulative?: boolean;
})
```

**Default today:** No `phase` → returns **all** rows (all phases). **SIM must pass `phase` or filter client-side** before launch.

### 4.4 Filtering rules (client-side today)

| Content | Filter |
|---------|--------|
| Orders | `row.phase === effectiveCurrentPhase` (or `<=` if cumulative) |
| Lab results (+ imaging/micro) | Same, by `lab_results.phase` |
| Medication orders & admins | Same; admins must reference orders in the **same** phase |
| Everything else | Unfiltered |

**Orphan rows:** Exclude any row where `phase > cases.phase_count`.

### 4.5 Phase advance alert (implemented)

When `case_sessions.current_phase` increases during **active simulation** (not pre-sim), an `AlertDialog` appears on **any chart tab** with copy pointing students to **Orders, Labs, and MAR**. The chart polls session phase every 4s.

### 4.6 Faculty actions (colleague / planned server)

```ts
advanceSessionPhase(sessionId: string): Promise<{ current_phase: number }>
// Preconditions: session.current_phase < cases.phase_count
// Post: current_phase += 1, optional phase_advanced_at = now()
```

---

## 5. Frontend NULL & invalid value defaults

Use shared helpers in `@/lib/simPhases` (and existing `@/lib/casePhases` for authoring).

| Input | Coercion | Used when |
|-------|----------|-----------|
| `cases.phase_count` | `null` / `undefined` / `NaN` → **1**; clamp to **[1, 10]** | Boot, faculty tiles |
| `case_sessions.current_phase` | `null` / `undefined` / `NaN` → **1**; clamp to **[1, phaseCount]** | Student chart, group label |
| `orders.phase`, `lab_results.phase`, etc. | `null` / invalid → **1** | Bundle mapping (`readPhase`) |
| `phase_count <= 1` | Hide phase UI (tabs, badges, advance button) | Student + faculty |
| `current_phase > phase_count` | Display & query as **phase_count** | Stale session after author lowers max |

### 5.1 UI behavior matrix

| `phase_count` | `current_phase` | Student chart | Faculty |
|---------------|-----------------|---------------|---------|
| `1` (or coerced) | `1` | No phase chrome; show phase-1 content only | No advance control |
| `> 1` | `1..N` | Banner/badge “Phase N”; filtered bundle | Advance when `N < phase_count` |
| `> 1` | missing session | Same as phase **1** | — |

### 5.2 What NOT to do

- Do not treat missing `phase` column on a row as “show in all phases” in sim — always coerce to **1**.
- Do not show `phase > phase_count` after author lowers max (DB rows may exist; sim ignores them).
- Do not require case builder changes for legacy cases — defaults cover them.

---

## 6. Backwards compatibility checklist

- [x] DB columns exist with `DEFAULT 1` (migration applied).
- [x] Chart layout loads `case_sessions.current_phase` when `routeContext.source === 'case_session'`.
- [x] `SimulationCaseContext` exposes `phaseContext`, `effectivePhases`, filtered `caseBundle`.
- [x] Orders / Labs use filtered bundle; MAR uses filtered bundle + session student administrations.
- [x] Phase advance alert on faculty-driven `current_phase` increase.
- [ ] `getCaseBundle` optional server-side `phase` filter (client filter is sufficient for now).
- [ ] Faculty advance action (`advanceSessionPhase`) — colleague.
- [ ] Tester/local draft: optional `currentPhase` in draft JSON.

---

## 7. TypeScript types (generated)

After migration, `database.types.ts` includes:

- `cases.phase_count: number`
- `case_sessions.current_phase: number`
- `orders.phase`, `lab_results.phase`, `medication_orders.phase`, `medication_administrations.phase`

Regenerate types after schema changes: `npx supabase gen types typescript …`.

---

## 8. Related files

| Area | File |
|------|------|
| Migration | `supabase/migrations/20260601120000_case_phases.sql` |
| Authoring | `docs/case-phases.md`, `src/lib/casePhases.ts` |
| Sim coercion | `src/lib/simPhases.ts` |
| Bundle load | `src/actions/case_builder/getCase.ts` |
| Chart boot | `src/app/simulation/.../chart/layout.tsx`, `chartSimulationBootstrap.tsx` |
| Session context | `src/actions/simulation/getSimulationContext.ts` |
