// src/components/TimeColumnHeader.tsx
import { formatTimeOffset } from "@/utils/form";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface TableFormHeaderProps {
  timePoint: number;
  isInPresim: boolean;
  onTogglePresim: (timePoint: number, checked: boolean | 'indeterminate') => void;
  onRemove: (timePoint: number) => void;
}

export function TableFormHeader({ timePoint, isInPresim, onTogglePresim, onRemove }: TableFormHeaderProps) {
  const { days, hours, minutes } = formatTimeOffset(timePoint);

  return (
    <div className="relative flex gap-1 justify-center items-center">
      <div className="grid grid-cols-[80px_20px] gap-x-2 p-1.5">
        <p className="text-gray-800 font-light">Days: </p>
        <p className="mb-1 ml-1">{days}</p>
        <p className="text-gray-800 font-light">Hours: </p>
        <p className="mb-1 ml-1">{hours}</p>
        <p className="text-gray-800 font-light">Minutes: </p>
        <p className="mb-1 ml-1">{minutes}</p>
        <p className="text-gray-800 font-light">In Pre-Sim?</p>
        <Checkbox
          checked={isInPresim}
          onCheckedChange={(check) => onTogglePresim(timePoint, check)}
          className="bg-white mt-1 border-gray-300"
          id="presim "
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(timePoint)}
        className="p-1 mt-1 self-start hover:bg-red-100 rounded text-slate-400 hover:text-red-600"
        title="Remove Column"
      >
        <X size={14} />
      </button>
    </div>
  );
}