"use server"

import { SupabaseClient } from "@supabase/supabase-js";
import {
  allMedications,
  MedAdministrationInstance,
  MedicationOrder,
} from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import {
  FrequencyEnum,
  MedicationAdministrationInsert,
  MedicationOrderInsert,
} from "@/lib/medicationTypes";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Med Orders tab writes orders; MAR tab writes administrations; full submit writes both. */
export type MedicationPersistPart = "orders" | "administrations" | "all";

export async function updateMedications(
  supabase: SupabaseClient,
  payload: { orders: MedicationOrder[]; administrations: MedAdministrationInstance[] },
  caseId: string,
  phase: number = 1,
  part: MedicationPersistPart = "all",
) {
  const medicationIdMap = await resolveDatabaseMedicationIds(supabase, payload.orders);
  const orderIdRemap = new Map<string, string>();
  const orderRows = transformMedicationOrdersToSchema(
    caseId,
    phase,
    payload.orders,
    medicationIdMap,
    orderIdRemap,
  );
  const adminRows = transformMedicationAdministrationsToSchema(
    caseId,
    phase,
    payload.orders,
    payload.administrations,
    medicationIdMap,
    orderIdRemap,
  );

  const hasIncomingOrders = payload.orders.length > 0;
  const hasPersistableOrders = orderRows.length > 0;
  const hasIncomingAdmins = payload.administrations.length > 0;
  const hasPersistableAdmins = adminRows.length > 0;

  if (part !== "administrations" && hasIncomingOrders && !hasPersistableOrders) {
    const unresolved = payload.orders
      .filter((o) => !medicationIdMap.has(o.medicationId))
      .map((o) => o.medicationId)
      .slice(0, 5);
    throw new Error(
      "Could not save medications: one or more drugs could not be linked to the medications table. " +
        (unresolved.length > 0 ? `Unresolved ids: ${unresolved.join(", ")}` : ""),
    );
  }

  if (part === "orders") {
    await syncMedicationOrders(supabase, caseId, phase, orderRows);
    return;
  }

  if (part === "administrations") {
    if (!hasIncomingAdmins && !hasPersistableAdmins) {
      return;
    }
    await replaceMedicationAdministrations(supabase, caseId, phase, adminRows);
    return;
  }

  const hasIncoming = hasIncomingOrders || hasIncomingAdmins;
  const hasPersistable = hasPersistableOrders || hasPersistableAdmins;
  if (hasIncoming && !hasPersistable) {
    const unresolved = payload.orders
      .filter((o) => !medicationIdMap.has(o.medicationId))
      .map((o) => o.medicationId)
      .slice(0, 5);
    throw new Error(
      "Could not save medications: one or more drugs could not be linked to the medications table. " +
        (unresolved.length > 0 ? `Unresolved ids: ${unresolved.join(", ")}` : ""),
    );
  }
  if (!hasPersistable) {
    return;
  }

  await replaceMedicationPhase(supabase, caseId, phase, orderRows, adminRows);
}

async function replaceMedicationPhase(
  supabase: SupabaseClient,
  caseId: string,
  phase: number,
  orderRows: MedicationOrderInsert[],
  adminRows: MedicationAdministrationInsert[],
) {
  const { error: deleteAdminErr } = await supabase
    .from("medication_administrations")
    .delete()
    .eq("case_id", caseId)
    .eq("phase", phase);
  if (deleteAdminErr) throw new Error(deleteAdminErr.message);

  const { error: deleteOrderErr } = await supabase
    .from("medication_orders")
    .delete()
    .eq("case_id", caseId)
    .eq("phase", phase);
  if (deleteOrderErr) throw new Error(deleteOrderErr.message);

  await insertMedicationOrders(supabase, orderRows);
  await insertMedicationAdministrations(supabase, adminRows);
}

/** Upsert orders by id; remove orders dropped from the payload (cascades their admins). */
async function syncMedicationOrders(
  supabase: SupabaseClient,
  caseId: string,
  phase: number,
  orderRows: MedicationOrderInsert[],
) {
  const { data: existing, error: fetchErr } = await supabase
    .from("medication_orders")
    .select("id")
    .eq("case_id", caseId)
    .eq("phase", phase);
  if (fetchErr) throw new Error(fetchErr.message);

  const incomingIds = new Set(orderRows.map((row) => row.id));
  const idsToRemove = (existing ?? [])
    .map((row) => row.id as string)
    .filter((id) => !incomingIds.has(id));

  if (idsToRemove.length > 0) {
    const { error: deleteErr } = await supabase
      .from("medication_orders")
      .delete()
      .in("id", idsToRemove);
    if (deleteErr) throw new Error(deleteErr.message);
  }

  if (orderRows.length > 0) {
    const { error: upsertErr } = await supabase
      .from("medication_orders")
      .upsert(orderRows, { onConflict: "id" });
    if (upsertErr) throw new Error(upsertErr.message);
  } else if ((existing ?? []).length > 0) {
    const { error: deleteAllErr } = await supabase
      .from("medication_orders")
      .delete()
      .eq("case_id", caseId)
      .eq("phase", phase);
    if (deleteAllErr) throw new Error(deleteAllErr.message);
  }
}

async function replaceMedicationAdministrations(
  supabase: SupabaseClient,
  caseId: string,
  phase: number,
  adminRows: MedicationAdministrationInsert[],
) {
  const { error: deleteAdminErr } = await supabase
    .from("medication_administrations")
    .delete()
    .eq("case_id", caseId)
    .eq("phase", phase);
  if (deleteAdminErr) throw new Error(deleteAdminErr.message);

  await insertMedicationAdministrations(supabase, adminRows);
}

function normalizeInfusionRate(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  return Number.isFinite(n) ? n : null;
}

function ensureOrderUuid(id: string): string {
  return UUID_RE.test(id) ? id : crypto.randomUUID();
}

function isPersistableOrder(order: MedicationOrder, medicationIdMap: Map<string, string>): boolean {
  return Boolean(order.id && medicationIdMap.has(order.medicationId));
}

function persistableOrderIds(
  orders: MedicationOrder[],
  medicationIdMap: Map<string, string>,
): Set<string> {
  return new Set(orders.filter((o) => isPersistableOrder(o, medicationIdMap)).map((o) => o.id));
}

function transformMedicationOrdersToSchema(
  caseId: string,
  phase: number,
  orders: MedicationOrder[],
  medicationIdMap: Map<string, string>,
  orderIdRemap: Map<string, string>,
): MedicationOrderInsert[] {
  return orders
    .filter((order) => isPersistableOrder(order, medicationIdMap))
    .map((order) => {
      const persistedId = ensureOrderUuid(order.id);
      if (persistedId !== order.id) {
        orderIdRemap.set(order.id, persistedId);
      }
      return {
        id: persistedId,
        case_id: caseId,
        phase,
        medication_id: medicationIdMap.get(order.medicationId)!,
        dose: Number(order.dose) || 0,
        frequency: (order.frequency?.trim() || "QD") as FrequencyEnum,
        priority: (order.priority?.trim() || "Routine") as MedicationOrderInsert["priority"],
        instructions: order.instructions?.trim() || null,
        indication: order.indication?.trim() || null,
        ordering_provider: order.orderingProvider?.trim() || null,
        infusion_rate: normalizeInfusionRate(order.infusionRate),
        is_in_presim: Boolean(order.visibleInPresim),
      };
    });
}

function transformMedicationAdministrationsToSchema(
  caseId: string,
  phase: number,
  orders: MedicationOrder[],
  medAdministrations: MedAdministrationInstance[],
  medicationIdMap: Map<string, string>,
  orderIdRemap: Map<string, string>,
): MedicationAdministrationInsert[] {
  const savedOrderIds = persistableOrderIds(orders, medicationIdMap);

  return medAdministrations
    .filter(
      (medAdmin) =>
        medAdmin.medicationOrderId && savedOrderIds.has(medAdmin.medicationOrderId),
    )
    .map((medAdmin) => {
      const resolvedOrderId =
        orderIdRemap.get(medAdmin.medicationOrderId) ?? medAdmin.medicationOrderId;
      return {
        case_id: caseId,
        phase,
        medication_order_id: resolvedOrderId,
        administrator: medAdmin.administratorId ?? "",
        time_offset: medAdmin.adminTimeMinuteOffset,
        status: medAdmin.status,
        notes: medAdmin.notes ?? "",
        administered_dose: medAdmin.administeredDose,
        is_in_presim: medAdmin.visibleInPresim,
      };
    });
}

/** Map frontend catalog ids (e.g. medAcetaminophenOral325) to medications table UUIDs. */
async function resolveDatabaseMedicationIds(
  supabase: SupabaseClient,
  orders: MedicationOrder[],
): Promise<Map<string, string>> {
  const catalogById = new Map(allMedications.map((med) => [med.id, med]));
  const resolved = new Map<string, string>();

  const catalogMedIds = new Set<string>();
  const directDbIds = new Set<string>();

  for (const order of orders) {
    const mid = order.medicationId?.trim();
    if (!mid) continue;
    if (UUID_RE.test(mid)) {
      directDbIds.add(mid);
    } else if (catalogById.has(mid)) {
      catalogMedIds.add(mid);
    }
  }

  if (directDbIds.size > 0) {
    const { data, error } = await supabase
      .from("medications")
      .select("id")
      .in("id", [...directDbIds]);
    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      resolved.set(row.id, row.id);
    }
  }

  const requestedCatalogMeds = [...catalogMedIds]
    .map((id) => catalogById.get(id))
    .filter((med): med is NonNullable<typeof med> => Boolean(med));

  if (requestedCatalogMeds.length === 0) {
    return resolved;
  }

  const genericNames = Array.from(new Set(requestedCatalogMeds.map((med) => med.genericName)));
  const { data, error } = await supabase
    .from("medications")
    .select("id, generic_name, route, strength")
    .in("generic_name", genericNames);

  if (error) throw new Error(error.message);

  const dbBySignature = new Map(
    (data ?? []).map((row) => [
      `${row.generic_name.toLowerCase()}|${row.route}|${Number(row.strength)}`,
      row.id,
    ]),
  );

  for (const med of requestedCatalogMeds) {
    const signature = `${med.genericName.toLowerCase()}|${med.route}|${Number(med.strength)}`;
    const dbId = dbBySignature.get(signature);
    if (dbId) resolved.set(med.id, dbId);
  }

  return resolved;
}

async function insertMedicationOrders(
  supabase: SupabaseClient,
  medicationOrders: MedicationOrderInsert[],
) {
  if (medicationOrders.length === 0) return;
  const { error: insertErr } = await supabase.from("medication_orders").insert(medicationOrders);
  if (insertErr) throw new Error(insertErr.message);
}

/** PostgREST schema has no medication_id on medication_administrations (dropped in #41). */
function toAdminInsertRow(row: MedicationAdministrationInsert): MedicationAdministrationInsert {
  return {
    case_id: row.case_id,
    phase: row.phase,
    medication_order_id: row.medication_order_id ?? null,
    administrator: row.administrator ?? null,
    time_offset: row.time_offset,
    status: row.status ?? null,
    notes: row.notes ?? null,
    administered_dose: row.administered_dose ?? null,
    infusion_rate: row.infusion_rate ?? null,
    is_in_presim: row.is_in_presim,
  };
}

async function insertMedicationAdministrations(
  supabase: SupabaseClient,
  medAdministrations: MedicationAdministrationInsert[],
) {
  if (medAdministrations.length === 0) return;
  const rows = medAdministrations.map(toAdminInsertRow);
  const { error: insertErr } = await supabase.from("medication_administrations").insert(rows);
  if (insertErr) throw new Error(insertErr.message);
}
