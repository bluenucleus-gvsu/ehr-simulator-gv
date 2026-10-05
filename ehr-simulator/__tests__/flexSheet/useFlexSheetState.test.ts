import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";
import { useFlexSheetState } from "@/hooks/useFlexSheetState";

const SIM_START = new Date("2024-01-01T08:00:00Z").getTime();

function checkboxRow(
  id: string,
  offset0: string | undefined,
  offset60: string | undefined,
): FlexSheetData {
  return {
    id,
    field: id,
    componentType: "checkboxlist",
    assessmentSubsets: [{ subsetId: "WDL", label: "WDL" }],
    ...(offset0 !== undefined ? { 0: offset0 } : {}),
    ...(offset60 !== undefined ? { 60: offset60 } : {}),
  };
}

const initialCharting = {
  rows: [
    checkboxRow("general_appearance_selections", "WDL,appearance", "WDL"),
    {
      id: "hr",
      field: "HR",
      componentType: "input",
      0: "72",
      60: "84",
    } as FlexSheetData,
    {
      id: "vitalSignsTitle",
      field: "Vital Signs",
      componentType: "static",
      rowType: "titleRow",
    } as FlexSheetData,
  ],
  timeOffsets: [0, 60],
  timeOffsetsInPreSim: new Set([0]),
};

function renderState(
  isPresim: boolean | null = false,
  canEdit = true,
  simStartTime: number | null = SIM_START,
) {
  const handleUnsavedCharting = vi.fn();
  const hook = renderHook(
    ({ isPresim: isPresimProp, canEdit: canEditProp }) =>
      useFlexSheetState({
        initialCharting,
        isPresim: isPresimProp,
        canEdit: canEditProp,
        simStartTime,
        handleUnsavedCharting,
      }),
    { initialProps: { isPresim, canEdit } },
  );
  return { hook, handleUnsavedCharting };
}

async function waitForOffsets(hook: { result: { current: { timeOffsets: number[] } } }, offsets: number[]) {
  await waitFor(() => expect(hook.result.current.timeOffsets).toEqual(offsets));
}

describe("useFlexSheetState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isPresim reconciliation", () => {
    it("leaves timeOffsets empty while isPresim is unresolved", () => {
      const { hook } = renderState(null);
      expect(hook.result.current.timeOffsets).toEqual([]);
    });

    it("seeds full timeOffsets when not in presim", async () => {
      const { hook } = renderState(false);
      await waitForOffsets(hook, [0, 60]);
    });

    it("seeds only presim timeOffsets when in presim", async () => {
      const { hook } = renderState(true);
      await waitForOffsets(hook, [0]);
    });

    it("re-seeds offsets when isPresim flips", async () => {
      const { hook } = renderState(false);
      await waitForOffsets(hook, [0, 60]);

      hook.rerender({ isPresim: true, canEdit: true });
      await waitForOffsets(hook, [0]);

      hook.rerender({ isPresim: false, canEdit: true });
      await waitForOffsets(hook, [0, 60]);
    });
  });

  describe("checkbox fieldSelections seeding", () => {
    it("seeds checkbox selections from saved values", async () => {
      const { hook } = renderState(false);
      await waitForOffsets(hook, [0, 60]);

      expect(hook.result.current.fieldSelections).toEqual({
        "general_appearance_selections-0": ["WDL", "appearance"],
        "general_appearance_selections-60": ["WDL"],
      });
    });

    it("seeds only presim checkbox selections in presim", async () => {
      const { hook } = renderState(true);
      await waitForOffsets(hook, [0]);

      expect(hook.result.current.fieldSelections).toEqual({
        "general_appearance_selections-0": ["WDL", "appearance"],
      });
    });
  });

  describe("handleCellUpdate", () => {
    it("updates the row, marks the column dirty, and flags unsaved changes", async () => {
      const { hook, handleUnsavedCharting } = renderState(false);
      await waitForOffsets(hook, [0, 60]);

      act(() => hook.result.current.handleCellUpdate(1, "60", "88"));

      expect(hook.result.current.data[1][60]).toBe("88");
      expect(hook.result.current.data[1][0]).toBe("72");
      expect(hook.result.current.dirtyColumns.has("60")).toBe(true);
      expect(handleUnsavedCharting).toHaveBeenCalledWith(true);
    });

    it("is a no-op when editing is disabled", async () => {
      const { hook, handleUnsavedCharting } = renderState(false, false);
      await waitForOffsets(hook, [0, 60]);

      act(() => hook.result.current.handleCellUpdate(1, "60", "88"));

      expect(hook.result.current.data[1][60]).toBe("84");
      expect(hook.result.current.dirtyColumns.size).toBe(0);
      expect(handleUnsavedCharting).not.toHaveBeenCalledWith(true);
    });
  });

  describe("handleSubsetSelection", () => {
    it("stores selections, writes the array into the row, and marks the column dirty", async () => {
      const { hook } = renderState(false);
      await waitForOffsets(hook, [0, 60]);

      act(() =>
        hook.result.current.handleSubsetSelection("general_appearance_selections", "0", ["WDL", "eyes"]),
      );

      expect(hook.result.current.fieldSelections["general_appearance_selections-0"]).toEqual([
        "WDL",
        "eyes",
      ]);
      expect(hook.result.current.data[0][0]).toEqual(["WDL", "eyes"]);
      expect(hook.result.current.dirtyColumns.has("0")).toBe(true);
    });

    it("is a no-op when editing is disabled", async () => {
      const { hook } = renderState(false, false);
      await waitForOffsets(hook, [0, 60]);

      act(() =>
        hook.result.current.handleSubsetSelection("general_appearance_selections", "0", ["WDL", "eyes"]),
      );

      expect(hook.result.current.fieldSelections["general_appearance_selections-0"]).toEqual([
        "WDL",
        "appearance",
      ]);
      expect(hook.result.current.dirtyColumns.size).toBe(0);
    });
  });

  describe("handleColumnAdd", () => {
    it("adds a sorted offset, seeds empty cells, shows a toast, and returns the new state", async () => {
      const { hook } = renderState(false);
      await waitForOffsets(hook, [0, 60]);

      let result: { timeOffsets: number[]; added: number } | null = null;
      act(() => {
        result = hook.result.current.handleColumnAdd(new Date(SIM_START + 90 * 60000));
      });

      expect(result).toEqual({ timeOffsets: [0, 60, 90], added: 90 });
      expect(hook.result.current.timeOffsets).toEqual([0, 60, 90]);
      expect(hook.result.current.data.every((row) => row[90] === "")).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });

    it("rejects a duplicate offset with an error toast and no mutation", async () => {
      const { hook } = renderState(false);
      await waitForOffsets(hook, [0, 60]);

      let result: { timeOffsets: number[]; added: number } | null = null;
      act(() => {
        result = hook.result.current.handleColumnAdd(new Date(SIM_START + 60 * 60000));
      });

      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalled();
      expect(hook.result.current.timeOffsets).toEqual([0, 60]);
    });

    it("is a no-op when the simulation start time is unknown", async () => {
      const { hook } = renderState(false, true, null);
      await waitForOffsets(hook, [0, 60]);

      let result: { timeOffsets: number[]; added: number } | null = null;
      act(() => {
        result = hook.result.current.handleColumnAdd(new Date(SIM_START + 90 * 60000));
      });

      expect(result).toBeNull();
      expect(toast.success).not.toHaveBeenCalled();
      expect(hook.result.current.timeOffsets).toEqual([0, 60]);
    });

    it("shows an error toast and does not mutate when editing is disabled", async () => {
      const { hook } = renderState(false, false);
      await waitForOffsets(hook, [0, 60]);

      let result: { timeOffsets: number[]; added: number } | null = null;
      act(() => {
        result = hook.result.current.handleColumnAdd(new Date(SIM_START + 90 * 60000));
      });

      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalled();
      expect(hook.result.current.timeOffsets).toEqual([0, 60]);
    });
  });

  describe("resetDirtyColumns", () => {
    it("clears dirty columns and flags no unsaved changes", async () => {
      const { hook, handleUnsavedCharting } = renderState(false);
      await waitForOffsets(hook, [0, 60]);

      act(() => hook.result.current.handleCellUpdate(1, "60", "88"));
      expect(hook.result.current.dirtyColumns.size).toBe(1);

      act(() => hook.result.current.resetDirtyColumns());

      expect(hook.result.current.dirtyColumns.size).toBe(0);
      expect(handleUnsavedCharting).toHaveBeenLastCalledWith(false);
    });
  });

  describe("beforeunload guard", () => {
    it("prevents navigation with unsaved changes", async () => {
      const { hook } = renderState(false);
      await waitForOffsets(hook, [0, 60]);

      act(() => hook.result.current.handleCellUpdate(1, "60", "88"));

      const event = new Event("beforeunload", { cancelable: true });
      act(() => window.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(true);
    });

    it("allows navigation with no unsaved changes", async () => {
      const { hook } = renderState(false);
      await waitForOffsets(hook, [0, 60]);

      const event = new Event("beforeunload", { cancelable: true });
      act(() => window.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(false);
    });
  });
});