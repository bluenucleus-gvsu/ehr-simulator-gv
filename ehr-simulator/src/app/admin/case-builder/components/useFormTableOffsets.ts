import { useState } from "react";
import { toast } from "sonner";


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
