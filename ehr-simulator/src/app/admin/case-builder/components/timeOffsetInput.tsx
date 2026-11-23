"use client"

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  timeOffsetMinutesFromParts,
  timeOffsetPartsFromMinutes,
  type TimeOffsetParts,
} from "@/utils/form";

type TimeOffsetPart = keyof TimeOffsetParts;

interface TimeOffsetInputProps {
  idPrefix: string;
  value: number | null;
  onChange: (value: number) => void;
  direction: "before" | "after";
  disabled?: boolean;
}

const MAX_PART_VALUE = 99999999;

export function TimeOffsetInput({
  idPrefix,
  value,
  onChange,
  direction,
  disabled = false,
}: Readonly<TimeOffsetInputProps>) {
  const [parts, setParts] = useState<TimeOffsetParts>(() =>
    timeOffsetPartsFromMinutes(value),
  );
  const lastEmittedValue = useRef<number | null>(value);

  useEffect(() => {
    if (value !== lastEmittedValue.current) {
      setParts(timeOffsetPartsFromMinutes(value));
      lastEmittedValue.current = value;
    }
  }, [value]);

  const handleChange = (
    part: TimeOffsetPart,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = event.target.value;
    let nextValue: number | '' = '';
    if (rawValue !== '') {
      const parsed = Number(rawValue);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_PART_VALUE) return;
      nextValue = parsed;
    }

    const nextParts = { ...parts, [part]: nextValue };
    const nextOffset = timeOffsetMinutesFromParts(nextParts, direction);
    setParts(nextParts);
    lastEmittedValue.current = nextOffset;
    onChange(nextOffset);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {(["days", "hours", "minutes"] as const).map((part) => (
        <div key={part} className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-${part}`} className="text-xs">{part}</Label>
          <Input
            id={`${idPrefix}-${part}`}
            type="number"
            min={0}
            max={MAX_PART_VALUE}
            step={1}
            value={parts[part]}
            disabled={disabled}
            onChange={(event) => handleChange(part, event)}
          />
        </div>
      ))}
    </div>
  );
}
