import { useState } from "react";
import { formatTimeOffset } from "@/utils/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Tag, X } from "lucide-react";
import type { LabColumn } from "@/lib/labTypes";

interface LabColumnFormHeaderProps {
  column: LabColumn;
  phaseCount: number;
  onTogglePresim: (id: string, checked: boolean | 'indeterminate') => void;
  onPhaseChange: (column: LabColumn, phase: number) => void;
  onLabelChange: (id: string, label: string) => void;
  onRemove: (id: string) => void;
}

export function LabColumnFormHeader({
  column,
  phaseCount,
  onTogglePresim,
  onPhaseChange,
  onLabelChange,
  onRemove,
}: LabColumnFormHeaderProps) {
  const { days, hours, minutes } = formatTimeOffset(column.time_offset ?? 0);
  const phases = Array.from({ length: Math.max(1, phaseCount - 1) }, (_, i) => i + 2);
  const isFacultyRelease = column.phase !== 1;
  const [labelDraft, setLabelDraft] = useState<string>(column.label ?? "");
  const [labelPopoverOpen, setLabelPopoverOpen] = useState<boolean>(false);

  const commitLabel = () => {
    onLabelChange(column.id, labelDraft);
    setLabelPopoverOpen(false);
  };

  return (
    <div className="relative flex gap-1 justify-center items-start">
      <div className="grid grid-cols-[4fr_3fr] gap-x-2 p-2 pr-0">
        {isFacultyRelease ? (
          <p className="col-span-2 text-xs font-medium text-emerald-600 mb-1">Faculty Release</p>
        ) : (
          <>
            <p className="text-gray-800 text-xs font-light">Days: </p>
            <p className="ml-1">{days}</p>
            <p className="text-gray-800 text-xs font-light">Hours: </p>
            <p className="ml-1">{hours}</p>
            <p className="text-gray-800 text-xs font-light">Minutes: </p>
            <p className="ml-1">{minutes}</p>
          </>
        )}
        <p className="text-gray-800 text-xs font-light mt-1">Phase:</p>
        {!isFacultyRelease ? (
          <p className="bg-white h-5 text-center rounded-md border border-gray-300 shadow-xs">1</p>
        ) : (
          <Select
            value={String(column.phase)}
            onValueChange={(value) => onPhaseChange(column, Number(value))}
          >
            <SelectTrigger className="h-5! text-xs my-1 px-2 bg-white border-gray-300">
              <SelectValue />
              <ChevronDown />
            </SelectTrigger>
            <SelectContent>
              {phases.map((phase) => (
                <SelectItem key={phase} value={String(phase)} className="text-xs">
                  {phase}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {isFacultyRelease && (
          <>
            <p className="text-gray-800 text-xs font-light mt-1">Label:</p>
            <Popover open={labelPopoverOpen} onOpenChange={setLabelPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-5! text-xs my-1 px-2 bg-white border-gray-300 justify-start gap-1 max-w-full"
                  title={column.label ?? "Add label"}
                >
                  <Tag className="size-3 shrink-0 text-slate-400" />
                  <span className="truncate max-w-16">
                    {column.label ?? "Add label"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-100 w-64 p-3 flex flex-col gap-2 bg-white shadow shadow-black/25 rounded-xl" sideOffset={4}>
                <Label htmlFor={`label-${column.id}`} className="text-xs font-semibold">
                  Label for Faculty
                </Label>
                <Input
                  id={`label-${column.id}`}
                  value={labelDraft}
                  onChange={(event) => setLabelDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitLabel();
                    }
                  }}
                  placeholder="e.g. BMP — 1h post-diuresis"
                  className="p-1 text-xs"
                  maxLength={80}
                />
                <Button
                  type="button"
                  size="sm"
                  className="w-full text-xs"
                  onClick={commitLabel}
                >
                  Add Label
                </Button>
              </PopoverContent>
            </Popover>
          </>
        )}
        {!isFacultyRelease &&
          (
            <div className="col-span-2 flex items-center gap-2 pt-1 pr-1">
              <p className="text-gray-800 text-xs font-light">In Pre-Sim?</p>
              <Checkbox
                checked={column.is_in_presim}
                onCheckedChange={(check) => onTogglePresim(column.id, check)}
                className="bg-white mt-1 border-gray-300"
                id={`presim-${column.id}`}
              />
            </div>
          )
        }
      </div>
      <button
        type="button"
        onClick={() => onRemove(column.id)}
        className="p-1 mt-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600"
        title="Remove Column"
      >
        <X size={14} />
      </button>
    </div>
  );
}
