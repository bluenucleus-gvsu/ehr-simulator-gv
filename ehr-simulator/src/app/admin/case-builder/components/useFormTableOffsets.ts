import { useState } from "react";
import { toast } from "sonner";
import { type LabColumn } from "@/lib/labTypes";

export function useTimePoints(initialPoints: number[], initialTimePointsInPresim: Set<number>) {
  const [timePoints, setTimePoints] = useState<number[]>(initialPoints);
  const [timePointsInPresim, setTimePointsInPresim] = useState<Set<number>>(initialTimePointsInPresim);

  const addTimePoint = (offset: number) => {
    if (timePoints.includes(offset)) {
      toast.warning("Time column already added");
      return;
    }
    setTimePoints(prev => [...prev, offset].sort((a, b) => a - b));
  };

  const removeTimePoint = (timeToRemove: number) => {
    setTimePoints(prev => prev.filter(t => t !== timeToRemove));
    setTimePointsInPresim(prev => {
      const newSet = new Set(prev);
      newSet.delete(timeToRemove);
      return newSet;
    });
  };

  const togglePresimInclusion = (timePoint: number, checked: boolean | 'indeterminate') => {
    setTimePointsInPresim(prev => {
      if (!checked) {
        const newSet = new Set(prev);
        newSet.delete(timePoint);
        return newSet;
      }
      return new Set([...prev, timePoint]);
    });
  };

  return {
    timePoints,
    timePointsInPresim,
    addTimePoint,
    removeTimePoint,
    togglePresimInclusion
  };
}

function sortLabColumns(columns: LabColumn[]): LabColumn[] {
  return [...columns].sort((a, b) => {
    const aOffset = a.time_offset;
    const bOffset = b.time_offset;
    if (aOffset == null && bOffset == null) return 0;
    if (aOffset == null) return 1;
    if (bOffset == null) return -1;
    return aOffset - bOffset;
  });
}

export function useLabColumns(initialColumns: LabColumn[], phaseCount = 1) {
  const [columns, setColumns] = useState<LabColumn[]>(initialColumns);

  const addTimeOffsetColumn = (offset: number) => {
    if (columns.some((column) => column.time_offset === offset)) {
      toast.warning("Time column already added");
      return;
    }
    setColumns(prev => sortLabColumns([
      ...prev,
      { id: crypto.randomUUID(), time_offset: offset, is_in_presim: false, phase: 1, label: null },
    ]));
  };

  const addFacultyReleaseColumn = () => {
    if (phaseCount < 2) {
      toast.warning("Single-phase cases cannot have faculty-released items");
      return;
    }
    setColumns(prev => [
      ...prev,
      { id: crypto.randomUUID(), time_offset: null, is_in_presim: false, phase: 2, label: null },
    ]);
  };

  const removeColumn = (id: string) => {
    setColumns(prev => prev.filter(column => column.id !== id));
  };

  const togglePresim = (id: string, checked: boolean | 'indeterminate') => {
    setColumns(prev => prev.map(column => {
      if (column.id !== id) return column;
      if (column.phase > 1 && checked) {
        toast.warning("Only Phase 1 columns can be included in Pre-Sim");
        return column;
      }
      return { ...column, is_in_presim: Boolean(checked) };
    }));
  };

  const setPhase = (column: LabColumn, phase: number) => {
    setColumns(prev => prev.map(c => {
      if (c.id !== column.id) return c;
      if (phase > 1) {
        return { ...c, phase, time_offset: null, is_in_presim: false };
      }
      return { ...c, phase, is_in_presim: c.is_in_presim, time_offset: c.time_offset ?? 0, label: null };
    }));
  };

  const setLabel = (id: string, label: string) => {
    setColumns(prev => prev.map(column => (
      column.id === id ? { ...column, label: label.trim() || null } : column
    )));
  };

  return {
    columns,
    addTimeOffsetColumn,
    addFacultyReleaseColumn,
    removeColumn,
    togglePresim,
    setPhase,
    setLabel,
  };
}
