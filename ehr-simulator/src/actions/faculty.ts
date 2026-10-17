"use server"

import { createVerifiedStaffClient } from "@/utils/supabase/staffAccess";
import { ActionResponse } from "./cases";
import { PREVIEW_SESSION_ID, ReleasableItemType, RELEASABLE_ITEMS, SessionItemReleasesByTable } from "@/lib/faculty/itemRelease";
import { Database } from "../../database.types";
import { createClient } from "@supabase/supabase-js";

export type ReleasableItem = {
  type: ReleasableItemType;
  id: string;
};

export type ReleasePendingItem = {
  type: ReleasableItemType;
  id: string;
  phase: number;
  label: string | null;
};

export type ReleasedItem = {
  type: ReleasableItemType;
  id: string;
  releasedAt: string;
  label: string | null;
};

export type ReleasePanelData = {
  pending: ReleasePendingItem[];
  released: ReleasedItem[];
};

const resolvePreviewSessionId = (id: string) =>
  id === PREVIEW_SESSION_ID ? "00000000-0000-0000-0000-000000000000" : id;

async function resolveSessionCaseId(
  supabase: ReturnType<typeof createClient<Database>>,
  sessionId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("case_sessions")
    .select("case_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.case_id ?? null;
}

export async function releaseSessionItems(
  sessionId: string,
  items: ReleasableItem[]
): Promise<ActionResponse<number>> {
  try {
    const { supabase, userId } = await createVerifiedStaffClient();

    if (items.length === 0) {
      return { success: false, message: "No items were specified." };
    }

    const caseId = await resolveSessionCaseId(supabase, sessionId);
    if (!caseId) {
      return { success: false, message: "Simulation session has no linked case." };
    }

    const releaseItemByType = new Map<ReleasableItemType, string[]>();
    items.forEach((item) => {
      const ids = releaseItemByType.get(item.type) ?? [];
      ids.push(item.id);
      releaseItemByType.set(item.type, ids);
    });

    let releasedCount = 0;

    for (const [type, ids] of releaseItemByType) {
      const target = RELEASABLE_ITEMS[type];
      if (!target) {
        return { success: false, message: `Unknown release item type: ${type}` };
      }

      const { data: itemRows, error: itemError } = await supabase
        .from(target.itemTable)
        .select("id, case_id")
        .in("id", ids);

      if (itemError) {
        return {
          success: false,
          message: `Failed to verify items (${itemError.message})`,
          error: itemError,
        };
      }

      const caseByItemId = new Map((itemRows ?? []).map((row) => [row.id, row.case_id]));
      if (ids.some((id) => !caseByItemId.has(id))) {
        return { success: false, message: "Some items were not found for this case." };
      }
      if (ids.some((id) => caseByItemId.get(id) !== caseId)) {
        return { success: false, message: "Some items do not belong to this session's case." };
      }

      const releasedAt = new Date().toISOString();
      const { error } = await supabase
        .from(target.releaseTable)
        .upsert(
          ids.map((id) => ({
            session_id: sessionId,
            item_id: id,
            released_by: userId,
            released_at: releasedAt,
          })),
          { onConflict: "session_id,item_id" },
        );

      if (error) {
        return {
          success: false,
          message: `Failed to release items (${error.message})`,
          error,
        };
      }

      releasedCount += ids.length;
    }

    return {
      success: true,
      message: `Released ${releasedCount} item${releasedCount === 1 ? "" : "s"}.`,
      data: releasedCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to release items.";
    console.error("Failed to release session items:", error);
    return { success: false, message };
  }
}

export async function unreleaseSessionItems(
  sessionId: string,
  items: ReleasableItem[]
): Promise<ActionResponse<number>> {
  try {
    const { supabase } = await createVerifiedStaffClient();

    if (items.length === 0) {
      return { success: false, message: "No items were specified." };
    }

    const byType = new Map<ReleasableItemType, string[]>();
    items.forEach((item) => {
      const ids = byType.get(item.type) ?? [];
      ids.push(item.id);
      byType.set(item.type, ids);
    });

    let unreleasedCount = 0;

    for (const [type, ids] of byType) {
      const target = RELEASABLE_ITEMS[type];
      if (!target) {
        return { success: false, message: `Unknown release item type: ${type}` };
      }

      const { error } = await supabase
        .from(target.releaseTable)
        .delete()
        .eq("session_id", sessionId)
        .in("item_id", ids);

      if (error) {
        return {
          success: false,
          message: `Failed to un-release items (${error.message})`,
          error,
        };
      }

      unreleasedCount += ids.length;
    }

    return {
      success: true,
      message: `Un-released ${unreleasedCount} item${unreleasedCount === 1 ? "" : "s"}.`,
      data: unreleasedCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to un-release items.";
    console.error("Failed to un-release session items:", error);
    return { success: false, message };
  }
}

export async function getReleasePanelData(
  sessionId: string
): Promise<ActionResponse<ReleasePanelData>> {
  try {
    const { supabase } = await createVerifiedStaffClient();
    const caseId = await resolveSessionCaseId(supabase, sessionId);
    if (!caseId) {
      return { success: false, message: "Simulation session has no linked case." };
    }

    const releasedResult = await getSessionItemReleases(sessionId);

    if (!releasedResult.success || !releasedResult.data) {
      return {
        success: false,
        message: releasedResult.message || "Failed to load released items.",
      };
    }

    const releasesByTable = releasedResult.data;

    const normalizeLabel = (label: unknown): string | null =>
      typeof label === "string" && label.trim() ? label : null;

    const pending: ReleasePendingItem[] = [];
    const released: ReleasedItem[] = [];

    for (const type of Object.keys(RELEASABLE_ITEMS) as ReleasableItemType[]) {
      const target = RELEASABLE_ITEMS[type];
      const releases = releasesByTable[target.releaseTable] ?? [];
      const releasedIds = new Set(releases.map((entry) => entry.itemId));

      if (releasedIds.size > 0) {
        const labelSelect =
          target.labelColumn === "title" ? "id, title" : "id, label";
        const { data: itemRows, error: itemError } = await supabase
          .from(target.itemTable)
          .select(labelSelect)
          .in("id", [...releasedIds]);

        if (itemError) {
          return {
            success: false,
            message: `Failed to load released item labels (${itemError.message})`,
            error: itemError,
          };
        }

        const labelById = new Map(
          (itemRows ?? []).map((row) => [
            row.id,
            normalizeLabel((row as Record<string, unknown>)[target.labelColumn]),
          ]),
        );
        releases.forEach((entry) => {
          released.push({
            type,
            id: entry.itemId,
            releasedAt: entry.releasedAt,
            label: labelById.get(entry.itemId) ?? null,
          });
        });
      }

      const pendingSelect =
        target.labelColumn === "title" ? "id, phase, title" : "id, phase, label";
      const { data: pendingRows, error: pendingError } = await supabase
        .from(target.itemTable)
        .select(pendingSelect)
        .eq("case_id", caseId)
        .gt("phase", 1);

      if (pendingError) {
        return {
          success: false,
          message: `Failed to load pending items (${pendingError.message})`,
          error: pendingError,
        };
      }

      (pendingRows ?? []).forEach((rawRow) => {
        const row = rawRow as Record<string, unknown>;
        if (releasedIds.has(String(row.id))) return;
        pending.push({
          type,
          id: String(row.id),
          phase: Math.max(1, Number(row.phase ?? 1)),
          label: normalizeLabel(row[target.labelColumn]),
        });
      });
    }

    return {
      success: true,
      message: "",
      data: { pending, released },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load release panel data.";
    console.error("Failed to load release panel data:", error);
    return { success: false, message };
  }
}


export async function getSessionItemReleases(
  sessionId: string
): Promise<ActionResponse<SessionItemReleasesByTable>> {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const targetSessionId = resolvePreviewSessionId(sessionId);

    const results = await Promise.all(
      Object.values(RELEASABLE_ITEMS).map(async ({ releaseTable }) => {
        const { data, error } = await supabase
          .from(releaseTable)
          .select("item_id, released_at")
          .eq("session_id", targetSessionId);
        return { releaseTable, data, error };
      })
    );

    const releases = {} as SessionItemReleasesByTable;

    for (const { releaseTable, data, error } of results) {
      if (error) {
        return {
          success: false,
          message: `Failed to load releases (${error.message})`,
          error,
        };
      }

      releases[releaseTable] = (data ?? []).map((row) => ({
        itemId: row.item_id,
        releasedAt: row.released_at,
      }));
    }

    return { success: true, message: "Successfully retrieved Sim item releases", data: releases };
  } catch (error) {
    console.error("Failed to load session item releases:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load session item releases.",
    };
  }
}