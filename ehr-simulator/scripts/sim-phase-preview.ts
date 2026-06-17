/**
 * Local dev helper: open a case in simulation and advance phases for testing.
 *
 * Usage:
 *   npx tsx scripts/sim-phase-preview.ts [caseId]
 *   npx tsx scripts/sim-phase-preview.ts advance <sessionId> <phase>
 *
 * Requires .env.local with Supabase keys. Dev server: npm run dev
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { getCaseBundle } from "../src/actions/case_builder/getCase";
import {
  filterCaseBundleForSimulation,
  resolveEffectivePhases,
  resolveSimulationPhaseContext,
} from "../src/lib/simPhases";

const DEFAULT_CASE_ID = "2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";

function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local");
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

function chartPath(caseId: string, sessionId: string, tab: string) {
  return `${SITE}/simulation/${caseId}/${sessionId}/chart/${tab}`;
}

async function printPhaseSummary(caseId: string, sessionId: string, currentPhase: number) {
  const bundle = await getCaseBundle(caseId);
  const phaseCount = bundle.caseRow.phase_count ?? 1;
  const ctx = resolveSimulationPhaseContext({ phaseCount, currentPhase });
  const effective = resolveEffectivePhases(bundle, ctx);
  const filtered = filterCaseBundleForSimulation(bundle, ctx);

  console.log("\n--- Simulation phase snapshot ---");
  console.log(`Case: ${bundle.caseRow.name ?? caseId} (phase_count=${phaseCount})`);
  console.log(`Session current_phase: ${currentPhase}`);
  console.log(
    `Effective phases → orders=${effective.orders}, labs=${effective.labs}, medOrders=${effective.medOrders}, mar=${effective.mar}`,
  );
  console.log(
    `Chart shows → ${filtered.orders.length} orders, ${filtered.labResults.length} labs, ${filtered.medicationOrders.length} med orders, ${filtered.medicationAdministrations.length} MAR rows`,
  );
  console.log("\nChart URLs (log in as student with dev bypass if prompted):");
  for (const tab of ["overview", "orders", "labs", "mar"] as const) {
    console.log(`  ${tab}: ${chartPath(caseId, sessionId, tab)}`);
  }
  console.log("\nAdvance phase (faculty simulation control — polls every ~4s):");
  console.log(
    `  npx tsx scripts/sim-phase-preview.ts advance ${sessionId} ${Math.min(currentPhase + 1, phaseCount)}`,
  );
  console.log(
    `  -- or SQL: UPDATE case_sessions SET current_phase = <n> WHERE id = '${sessionId}';`,
  );
}

async function createPreview(caseId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: caseRow, error: caseErr } = await supabase
    .from("cases")
    .select("id, name, phase_count")
    .eq("id", caseId)
    .maybeSingle();
  if (caseErr) throw caseErr;
  if (!caseRow) throw new Error(`Case not found: ${caseId}`);

  const { data: existing } = await supabase
    .from("case_sessions")
    .select("id, current_phase, status")
    .eq("case_id", caseId)
    .eq("status", "in progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sessionId = existing?.id;
  let currentPhase = existing?.current_phase ?? 1;

  if (!sessionId) {
    const { data: created, error: createErr } = await supabase
      .from("case_sessions")
      .insert({
        case_id: caseId,
        status: "in progress",
        current_phase: 1,
        started_at: new Date().toISOString(),
      })
      .select("id, current_phase")
      .single();
    if (createErr) throw createErr;
    sessionId = created.id;
    currentPhase = created.current_phase ?? 1;
    console.log(`Created in-progress session ${sessionId}`);
  } else {
    console.log(`Reusing in-progress session ${sessionId} (phase ${currentPhase})`);
  }

  await printPhaseSummary(caseId, sessionId, currentPhase);
}

async function advanceSession(sessionId: string, phase: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: session, error: sessErr } = await supabase
    .from("case_sessions")
    .select("id, case_id, current_phase")
    .eq("id", sessionId)
    .maybeSingle();
  if (sessErr) throw sessErr;
  if (!session?.case_id) throw new Error(`Session not found: ${sessionId}`);

  const { data: caseRow } = await supabase
    .from("cases")
    .select("phase_count")
    .eq("id", session.case_id)
    .maybeSingle();
  const max = caseRow?.phase_count ?? 10;
  const next = Math.max(1, Math.min(max, phase));

  const { error: updErr } = await supabase
    .from("case_sessions")
    .update({ current_phase: next, status: "in progress" })
    .eq("id", sessionId);
  if (updErr) throw updErr;

  console.log(`Session ${sessionId} → current_phase = ${next}`);
  await printPhaseSummary(session.case_id, sessionId, next);
}

async function main() {
  loadEnvLocal();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const [cmd, arg1, arg2] = process.argv.slice(2);

  if (cmd === "advance") {
    if (!arg1 || !arg2) {
      throw new Error("Usage: npx tsx scripts/sim-phase-preview.ts advance <sessionId> <phase>");
    }
    await advanceSession(arg1, Number(arg2));
    return;
  }

  const caseId = cmd && cmd !== "advance" ? cmd : DEFAULT_CASE_ID;
  await createPreview(caseId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
