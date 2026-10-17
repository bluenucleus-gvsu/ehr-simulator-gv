import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { toast } from "sonner";

import { useLabColumns } from "@/app/admin/case-builder/components/useFormTableOffsets";
import { type LabColumn } from "@/lib/labTypes";

vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
  },
}));

const timeOffsetColumn = (overrides: Partial<LabColumn> = {}): LabColumn => ({
  id: "col-baseline",
  time_offset: 0,
  is_in_presim: false,
  phase: 1,
  label: null,
  ...overrides,
});

const facultyReleaseColumn = (overrides: Partial<LabColumn> = {}): LabColumn => ({
  id: "col-faculty-release",
  time_offset: null,
  is_in_presim: false,
  phase: 2,
  label: null,
  ...overrides,
});

beforeEach(() => {
  vi.mocked(toast.warning).mockClear();
});

describe("useLabColumns", () => {
  describe("addTimeOffsetColumn", () => {
    it("appends a time_offset column and keeps offsets sorted with faculty-release columns last", () => {
      const { result } = renderHook(() =>
        useLabColumns([facultyReleaseColumn(), timeOffsetColumn({ id: "col-30", time_offset: 30 })], 3),
      );

      act(() => result.current.addTimeOffsetColumn(-60));

      expect(result.current.columns.map((column) => column.time_offset)).toEqual([
        -60, 30, null,
      ]);
      const added = result.current.columns[0];
      expect(added).toMatchObject({
        time_offset: -60,
        is_in_presim: false,
        phase: 1,
        label: null,
      });
      expect(toast.warning).not.toHaveBeenCalled();
    });

    it("rejects a duplicate fixed offset with a toast", () => {
      const { result } = renderHook(() => useLabColumns([timeOffsetColumn()], 3));

      act(() => result.current.addTimeOffsetColumn(0));

      expect(result.current.columns).toHaveLength(1);
      expect(toast.warning).toHaveBeenCalledWith("Time column already added");
    });

    it("does not treat a staged column's NULL offset as a duplicate", () => {
      const { result } = renderHook(() =>
        useLabColumns([
          timeOffsetColumn({ id: "col-30", time_offset: 30 }),
          facultyReleaseColumn({ id: "col-faculty-release", time_offset: null, phase: 2 }),
        ], 3),
      );

      act(() => result.current.addTimeOffsetColumn(0));

      expect(toast.warning).not.toHaveBeenCalled();
      expect(result.current.columns.map((column) => column.time_offset)).toEqual([0, 30, null]);
    });
  });

  describe("addFacultyReleaseColumn", () => {
    it("appends a staged live column with default phase 2 and no toast", () => {
      const { result } = renderHook(() => useLabColumns([timeOffsetColumn()], 3));

      act(() => result.current.addFacultyReleaseColumn());

      const added = result.current.columns[1];
      expect(added).toMatchObject({
        time_offset: null,
        is_in_presim: false,
        phase: 2,
        label: null,
      });
      expect(added.id).not.toBe("col-baseline");
      expect(toast.warning).not.toHaveBeenCalled();
    });

    it("allows multiple live-release columns", () => {
      const { result } = renderHook(() => useLabColumns([], 3));

      act(() => {
        result.current.addFacultyReleaseColumn();
        result.current.addFacultyReleaseColumn();
      });

      expect(result.current.columns).toHaveLength(2);
      const ids = new Set(result.current.columns.map((column) => column.id));
      expect(ids.size).toBe(2);
    });

    it("blocks single-phase cases with a toast", () => {
      const { result } = renderHook(() => useLabColumns([], 1));

      act(() => result.current.addFacultyReleaseColumn());

      expect(result.current.columns).toHaveLength(0);
      expect(toast.warning).toHaveBeenCalledWith(
        "Single-phase cases cannot have faculty-released items",
      );
    });
  });

  describe("setPhase", () => {
    it("forces a staged column live: drops the offset and clears presim", () => {
      const fixed = timeOffsetColumn({ id: "col-a", time_offset: 30, is_in_presim: true });
      const { result } = renderHook(() => useLabColumns([fixed], 3));

      act(() => result.current.setPhase(fixed, 2));

      expect(result.current.columns[0]).toMatchObject({
        id: "col-a",
        phase: 2,
        time_offset: null,
        is_in_presim: false,
      });
    });

    it("restores a baseline offset of 0 when a staged column moves to phase 1 and clears the label", () => {
      const staged = facultyReleaseColumn({ id: "col-a", label: "Repeat BMP" });
      const { result } = renderHook(() => useLabColumns([staged], 3));

      act(() => result.current.setPhase(staged, 1));

      expect(result.current.columns[0]).toMatchObject({
        id: "col-a",
        phase: 1,
        time_offset: 0,
        label: null,
      });
    });

    it("updates only the targeted column", () => {
      const keep = timeOffsetColumn({ id: "col-keep", time_offset: 30 });
      const change = timeOffsetColumn({ id: "col-change", time_offset: 60 });
      const { result } = renderHook(() => useLabColumns([keep, change], 3));

      act(() => result.current.setPhase(change, 3));

      expect(result.current.columns[0].time_offset).toBe(30);
      expect(result.current.columns[1]).toMatchObject({ id: "col-change", phase: 3 });
    });
  });

  describe("togglePresim", () => {
    it("toggles presim on a baseline column", () => {
      const baseline = timeOffsetColumn({ id: "col-a" });
      const { result } = renderHook(() => useLabColumns([baseline], 3));

      act(() => result.current.togglePresim("col-a", true));

      expect(result.current.columns[0].is_in_presim).toBe(true);
    });

    it("rejects presim on a staged column with a toast", () => {
      const staged = facultyReleaseColumn({ id: "col-a" });
      const { result } = renderHook(() => useLabColumns([staged], 3));

      act(() => result.current.togglePresim("col-a", true));

      expect(result.current.columns[0].is_in_presim).toBe(false);
      expect(toast.warning).toHaveBeenCalledWith(
        "Only Phase 1 columns can be included in Pre-Sim",
      );
    });
  });

  describe("removeColumn", () => {
    it("drops only the targeted column", () => {
      const keepA = timeOffsetColumn({ id: "col-keep-a" });
      const drop = timeOffsetColumn({ id: "col-drop" });
      const keepB = facultyReleaseColumn({ id: "col-keep-b" });
      const { result } = renderHook(() => useLabColumns([keepA, drop, keepB], 3));

      act(() => result.current.removeColumn("col-drop"));

      expect(result.current.columns.map((column) => column.id)).toEqual([
        "col-keep-a",
        "col-keep-b",
      ]);
    });
  });

  describe("setLabel", () => {
    it("stores trimmed labels and blanks as null", () => {
      const column = facultyReleaseColumn({ id: "col-a" });
      const { result } = renderHook(() => useLabColumns([column], 3));

      act(() => result.current.setLabel("col-a", "  BMP — repeat draw  "));
      expect(result.current.columns[0].label).toBe("BMP — repeat draw");

      act(() => result.current.setLabel("col-a", "   "));
      expect(result.current.columns[0].label).toBeNull();
    });
  });
});
