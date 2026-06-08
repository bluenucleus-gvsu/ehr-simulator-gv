# Case Phases — Team README (Schema & Implementation)

This document explains **what changed in the database**, **how the app uses it**, and **how to work with multi-phase cases** without breaking existing single-phase sims.

**Migration file:** `supabase/migrations/20260601120000_case_phases.sql`

**Deeper references:**

- Case builder authoring: [case-phases.md](./case-phases.md)
- Simulation contract & NULL defaults: [sim-phases-schema.md](./sim-phases-schema.md)

---

## What problem this solves

Clinical cases can progress over time (e.g. patient deteriorates). Authors need **different Orders, Labs, and MAR content per phase**, while demographics, history, notes, charting, and I/O stay shared.

During simulation, each **student group** (case session) starts at **Phase 1**. Faculty can advance the group to Phase 2, 3, etc. Students then see updated Orders, Labs, and MAR for that phase.

---

## Schema changes (summary)

### New / changed columns

| Table | Column | Type | Default | Purpose |
|-------|--------|------|---------|---------|
| `cases` | `phase_count` | `integer NOT NULL` | `1` | Max phases for this case (1–10). |
| `case_sessions` | `current_phase` | `integer NOT NULL` | `1` | Which phase this group is on during sim. |
| `orders` | `phase` | `integer NOT NULL` | `1` | Which phase this order belongs to. |
| `lab_results` | `phase` | `integer NOT NULL` | `1` | Which phase this lab time column belongs to. |
| `medication_orders` | `phase` | `integer NOT NULL` | `1` | Which phase this med order belongs to. |
| `medication_administrations` | `phase` | `integer NOT NULL` | `1` | Which phase this MAR row belongs to. |

### Constraints & indexes

- `cases.phase_count`: `CHECK (phase_count >= 1 AND phase_count <= 10)`
- `case_sessions.current_phase`: `CHECK (current_phase >= 1)`
- `lab_results`: unique key changed from `(case_id, time_offset)` to **`(case_id, phase, time_offset)`** so the same time offset can exist in different phases.
- Indexes on `(case_id, phase)` for orders, lab_results, medication_orders, medication_administrations.

### Tables **not** given a `phase` column

Demographics, history, clinical documents, documentation/charting, intake/output, and related shared chart data are **unchanged** — one copy per case for all phases.

---

## Backwards compatibility (legacy cases)

| Scenario | Behavior |
|----------|----------|
| Case created before migration | All new columns default to **`1`**. Behaves like a single-phase case. |
| `phase_count = 1` | No phase UI in sim; only phase-1 content shown. |
| Missing / invalid phase in API | Frontend coerces to **phase 1** (`readPhase`, `resolvePhaseCount`, etc.). |
| Author lowers max phases | Only `cases.phase_count` is updated. Rows with `phase > phase_count` **stay in DB** (soft-hidden) and reappear if max is raised again. |

**No NULL phase semantics in production:** columns are `NOT NULL DEFAULT 1`. App code still defensively treats bad values as 1.

---

## How data is authored (case builder)

1. **Max phases** — Header control sets `cases.phase_count` (1–10).
2. **Per-tab phases** — Orders, Labs, Med Orders, and MAR each have their **own** phase progression (Phase 1 → + Phase 2 → … on that tab only).
3. **Carry-over** — Creating phase N+1 copies **that tab’s** content from phase N. Medication order UUIDs are **remapped** on copy so each phase can be saved without primary-key conflicts.
4. **Save** — Each section saves rows with the correct `phase` column. Save All loops each tab’s initialized phases independently.

See [case-phases.md](./case-phases.md) for UI details.

---

## How simulation uses the schema

### Session phase (runtime)

- On chart load: read `case_sessions.current_phase` (defaults to **1**).
- Poll every **~4 seconds** for changes (simulates faculty advance without requiring a page refresh).
- Phase polling uses the **session id** from the URL’s second segment when present (`/simulation/{caseOrRoute}/{sessionId}/chart/...`).

### What students see per tab

Content is filtered by **effective phase per section**, not always the raw session phase:

When the session is on **simulation phase 4**, but the author only built Orders through **phase 2**:

| Tab | Effective content |
|-----|-------------------|
| Orders | Latest authored orders phase **≤ 4** → phase **2** |
| Labs | Latest authored labs phase **≤ 4** → e.g. phase **4** if authored |
| MAR (med orders + admins) | Same rule per medication table |

Logic: `resolveEffectivePhases()` + `filterCaseBundleForSimulation()` in `src/lib/simPhases.ts`.

### Phase advance alert

When `current_phase` **increases** during **active simulation** (not pre-sim), a dialog tells students to review **Orders, Labs, and MAR**.

Implementation: `src/app/simulation/.../chart/components/phaseAdvanceAlert.tsx`.

### Faculty integration (your colleague)

Faculty UI only needs to **increment** `case_sessions.current_phase` (while `< cases.phase_count`). Example:

```sql
UPDATE public.case_sessions
SET current_phase = current_phase + 1
WHERE id = '<session_uuid>'
  AND current_phase < (
    SELECT phase_count FROM public.cases WHERE id = case_sessions.case_id
  );
```

Planned server action: `advanceSessionPhase(sessionId)` — not required if faculty writes `current_phase` directly.

---

## Applying the migration locally

From `ehr-simulator/`:

```bash
# If using local Supabase
npx supabase db reset   # or: npx supabase migration up

# Regenerate TypeScript types after schema change
npx supabase gen types typescript --local > database.types.ts
```

Confirm columns exist:

```sql
SELECT phase_count FROM public.cases LIMIT 1;
SELECT current_phase FROM public.case_sessions LIMIT 1;
SELECT phase FROM public.orders LIMIT 1;
```

---

## Manual testing (without faculty UI)

1. Open an **in progress** case session in the chart (active sim, not pre-sim).
2. Note Orders / Labs / MAR at phase 1.
3. In Supabase SQL editor:

```sql
UPDATE public.case_sessions
SET current_phase = 2
WHERE id = '<your_session_uuid>';
```

4. Within ~4 seconds, expect the phase-advance dialog and updated Orders/Labs/MAR.
5. Reset: `UPDATE case_sessions SET current_phase = 1 WHERE id = '...';`

To test per-tab effective phases, set `current_phase = 4` on a case where orders only exist for phases 1–2 but labs exist through 4 — Orders should stay at phase 2 content, Labs at phase 4.

---

## Important implementation notes for developers

### Medication orders: one UUID per phase row

`medication_orders.id` is a global primary key. Copying orders to a new phase **must** assign new UUIDs (`src/lib/caseBuilder/remapMedicationOrderIds.ts`). Save All dedupes IDs across phases before insert.

### MAR in simulation

- Case template administrations come from the **filtered** case bundle (phase-aware).
- Student-documented administrations still load from `student_medication_administrations` / session views by session id.

### Single-phase cases

If `phase_count = 1`, phase banner and advance alert logic are effectively no-ops; chart matches pre-phases behavior.

---

## File map

| Area | Location |
|------|----------|
| SQL migration | `supabase/migrations/20260601120000_case_phases.sql` |
| Authoring constants | `src/lib/casePhases.ts` |
| Sim filtering & alerts | `src/lib/simPhases.ts` |
| Phase cache / save | `src/lib/caseBuilder/` |
| Case builder UI | `src/app/admin/case-builder/components/phaseTabNav.tsx`, `casePhaseControls.tsx` |
| Sim context | `src/context/SimulationCaseContext.tsx` |
| Sim phase load | `src/actions/simulation/getSimulationContext.ts` → `getSimulationPhaseState()` |
| Phase alert UI | `src/app/simulation/.../chart/components/phaseAdvanceAlert.tsx` |
| Generated DB types | `database.types.ts` |

---

## Status checklist

| Item | Status |
|------|--------|
| DB migration (`phase_count`, `phase`, `current_phase`) | Done |
| Case builder multi-phase authoring | Done |
| Per-tab independent phase progression (Orders/Labs/MAR) | Done |
| Sim: filter bundle by session + effective phase | Done |
| Sim: phase advance alert + polling | Done |
| Faculty advance button / dashboard | In progress (colleague) |
| Optional: server-side `getCaseBundle({ phase })` | Not required (client filters today) |
| Optional: `sim_phase_display_mode` cumulative vs replace | Future |

---

## Future-proofing (optional follow-up migrations)

Documented in [sim-phases-schema.md](./sim-phases-schema.md) §3 — not applied yet:

- `case_sessions.phase_advanced_at` — audit trail when faculty advances
- `cases.sim_phase_display_mode` — `'replace'` (default) vs `'cumulative'`
- DB trigger to cap `current_phase <= cases.phase_count`

These are optional; application code can enforce limits until needed.

---

## Questions?

- **“Will old cases break?”** No — defaults to phase 1 everywhere.
- **“Can each tab have different max authored phase?”** Yes — sim uses the latest authored phase ≤ session phase per section.
- **“What does faculty need to write?”** Only `case_sessions.current_phase` (and eventually a UI that does the same).
