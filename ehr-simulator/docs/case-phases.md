# Case phases (Orders, Labs, MAR)

Multi-phase cases let authors define different **Orders**, **Labs**, and **MAR** content per phase. Demographics, history, notes, charting, and I/O are shared across all phases.

**Team overview (schema + sim + migration):** [PHASES-TEAM-README.md](./PHASES-TEAM-README.md)

## Database

| Column / table | Purpose |
|----------------|---------|
| `cases.phase_count` | How many phases exist for this case (1–10). UI only shows phases `1..phase_count`. |
| `orders.phase` | Phase number for each order row (default `1`). |
| `lab_results.phase` | Phase for each lab time column set. Unique key: `(case_id, phase, time_offset)`. |
| `medication_orders.phase` | Phase for med orders. |
| `medication_administrations.phase` | Phase for MAR administrations. |
| `case_sessions.current_phase` | Which phase a group is on during simulation (1-based). Used by faculty sim UI (follow-up). |

**Lowering `phase_count`:** Only `cases.phase_count` is updated. Rows with `phase > phase_count` remain in the database and reappear if the count is raised again.

## Case builder

- Header: set **Phases** count → **Update**, then choose **Editing** phase when count > 1.
- Orders, Labs, Med orders, and MAR steps: content is scoped to the active phase.
- **Max phases** (header next to Save): upper limit on how many phases can be created.
- **Per-tab navigation** (Orders, Labs, Med Orders, MAR): colored **Phase 1**, **Phase 2**, … buttons to switch; **+ Phase N** creates the next phase by copying from the previous phase.
- **Raising max phases** after lowering it: re-expanded phases with saved data prompt **Copy from Phase N−1** vs **Use saved Phase N data**.

## Colleague contract (simulation management)

Faculty UI can use:

- `cases.phase_count` — number of phase tiles / max advance.
- `case_sessions.current_phase` — label under each group (“Phase N”).

Planned server actions (not wired in student chart yet):

- `advanceSessionPhase(sessionId)` — increment `current_phase` when `< phase_count`.
- `getCaseBundle(caseId, { phase })` — load Orders/Labs/MAR for one phase during simulation.

Student chart filtering by `current_phase` is a separate follow-up. See **[sim-phases-schema.md](./sim-phases-schema.md)** for the full SIM schema contract, backwards compatibility, and frontend NULL defaults (`src/lib/simPhases.ts`).
