import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { focusColumnOffset, useFlexSheetPagination } from "@/hooks/useFlexSheetPagination";

const TABLE_WIDTH = 6;

function range(length: number): number[] {
  return Array.from({ length }, (_, i) => i);
}

function render(offsets: number[], width = TABLE_WIDTH) {
  return renderHook(
    ({ timeOffsets, tableWidth }) => useFlexSheetPagination(timeOffsets, tableWidth),
    { initialProps: { timeOffsets: offsets, tableWidth: width } },
  );
}

describe("useFlexSheetPagination", () => {
  describe("initial alignment when time offsets populate asynchronously", () => {
    it("starts at the leftmost offset while empty", () => {
      const { result } = render([]);
      expect(result.current.columnOffset).toBe(0);
      expect(result.current.slicedTimeOffsets).toEqual([]);
    });

    it("snaps to the most-recent page once offsets are populated (8 cols)", async () => {
      const { result, rerender } = render([]);
      rerender({ timeOffsets: range(8), tableWidth: 6 });

      await waitFor(() => expect(result.current.columnOffset).toBe(2));
      expect(result.current.slicedTimeOffsets).toEqual([2, 3, 4, 5, 6, 7]);
    });

    it("keeps the current window once aligned when columns are added", async () => {
      const { result, rerender } = render(range(8));
      await waitFor(() => expect(result.current.columnOffset).toBe(2));

      rerender({ timeOffsets: range(10), tableWidth: 6 });
      expect(result.current.columnOffset).toBe(2);
      expect(result.current.slicedTimeOffsets).toEqual([2, 3, 4, 5, 6, 7]);
    });

    it("clamps the window when offsets shrink below the current offset", async () => {
      const { result, rerender } = render(range(8));
      await waitFor(() => expect(result.current.columnOffset).toBe(2));

      rerender({ timeOffsets: [0], tableWidth: 6 });
      await waitFor(() => expect(result.current.columnOffset).toBe(0));
      expect(result.current.slicedTimeOffsets).toEqual([0]);
    });
  });

  describe("right-aligned paging model", () => {
    it("shows the most recent 6 columns on first render", async () => {
      const { result } = render(range(7));
      await waitFor(() => expect(result.current.columnOffset).toBe(1));
      expect(result.current.slicedTimeOffsets).toEqual([1, 2, 3, 4, 5, 6]);

      act(() => result.current.handleColOffsetChange(-TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(0);
      expect(result.current.slicedTimeOffsets).toEqual([0]);

      act(() => result.current.handleColOffsetChange(TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(1);
      expect(result.current.slicedTimeOffsets).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("pages 10 offsets as a 4-column earliest page and a 6-column recent page", async () => {
      const { result } = render(range(10));
      await waitFor(() => expect(result.current.columnOffset).toBe(4));
      expect(result.current.slicedTimeOffsets).toEqual([4, 5, 6, 7, 8, 9]);

      act(() => result.current.handleColOffsetChange(-TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(0);
      expect(result.current.slicedTimeOffsets).toEqual([0, 1, 2, 3]);

      act(() => result.current.handleColOffsetChange(TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(4);
      expect(result.current.slicedTimeOffsets).toEqual([4, 5, 6, 7, 8, 9]);
    });

    it("pages 14 offsets as 0..1, 2..7, 8..13", async () => {
      const { result } = render(range(14));
      await waitFor(() => expect(result.current.columnOffset).toBe(8));
      expect(result.current.slicedTimeOffsets).toEqual([8, 9, 10, 11, 12, 13]);

      act(() => result.current.handleColOffsetChange(-TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(2);
      expect(result.current.slicedTimeOffsets).toEqual([2, 3, 4, 5, 6, 7]);

      act(() => result.current.handleColOffsetChange(-TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(0);
      expect(result.current.slicedTimeOffsets).toEqual([0, 1]);

      act(() => result.current.handleColOffsetChange(TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(2);
      expect(result.current.slicedTimeOffsets).toEqual([2, 3, 4, 5, 6, 7]);
    });

    it("reset returns to the most-recent page", async () => {
      const { result } = render(range(10));
      await waitFor(() => expect(result.current.columnOffset).toBe(4));
      act(() => result.current.handleColOffsetChange(-TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(0);
      act(() => result.current.handleColOffsetChange("reset"));
      expect(result.current.columnOffset).toBe(4);
      expect(result.current.slicedTimeOffsets).toEqual([4, 5, 6, 7, 8, 9]);
    });
  });

  describe("small and empty inputs", () => {
    it("shows all offsets when there are fewer than tableWidth", async () => {
      const { result } = render(range(4));
      await waitFor(() => expect(result.current.columnOffset).toBe(0));
      expect(result.current.slicedTimeOffsets).toEqual([0, 1, 2, 3]);

      act(() => result.current.handleColOffsetChange(TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(0);
      act(() => result.current.handleColOffsetChange(-TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(0);
    });

    it("shows all offsets when the count exactly matches tableWidth", async () => {
      const { result } = render(range(6));
      await waitFor(() => expect(result.current.columnOffset).toBe(0));
      expect(result.current.slicedTimeOffsets).toEqual([0, 1, 2, 3, 4, 5]);

      act(() => result.current.handleColOffsetChange(TABLE_WIDTH));
      expect(result.current.columnOffset).toBe(0);
    });
  });

  describe("setColumnOffset", () => {
    it("exposes a direct setter that moves the window", async () => {
      const { result } = render(range(10));
      await waitFor(() => expect(result.current.columnOffset).toBe(4));
      act(() => result.current.setColumnOffset(0));
      expect(result.current.columnOffset).toBe(0);
      expect(result.current.slicedTimeOffsets).toEqual([0, 1, 2, 3]);
    });
  });
});

describe("focusColumnOffset", () => {
  it("snaps to the most-recent page for the newest column", () => {
    expect(focusColumnOffset(range(10), 9, 6)).toBe(4);
    expect(focusColumnOffset(range(7), 6, 6)).toBe(1);
  });

  it("snaps to the earliest page for the oldest column", () => {
    expect(focusColumnOffset(range(10), 0, 6)).toBe(0);
  });

  it("snaps to the page containing a middle column", () => {
    expect(focusColumnOffset(range(14), 5, 6)).toBe(2);
    expect(focusColumnOffset(range(14), 7, 6)).toBe(2);
    expect(focusColumnOffset(range(14), 8, 6)).toBe(8);
  });

  it("returns 0 when offsets fit on a single page", () => {
    expect(focusColumnOffset(range(4), 2, 6)).toBe(0);
  });

  it("returns 0 for an unknown target", () => {
    expect(focusColumnOffset(range(10), 99, 6)).toBe(0);
  });
});