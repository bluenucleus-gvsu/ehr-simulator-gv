"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeOffsetInput } from "@/app/admin/case-builder/components/timeOffsetInput";
import { timeOffsetPartsFromMinutes } from "@/utils/form";

interface AddTimeColumnButtonProps {
  handleColumnAdd: (time: number) => void;
}

export function AddTableColumn({ handleColumnAdd }: AddTimeColumnButtonProps) {
  const [timeOffset, setTimeOffset] = useState<number | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const { days, hours, minutes } = timeOffsetPartsFromMinutes(timeOffset);

  const onColumnAdd = (offset: number) => {
    setIsPopoverOpen(false);
    handleColumnAdd(offset);
    setTimeOffset(null);
  }

  return (
    <div className="">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className="text-sm"
            variant='outline'
          >
            <Clock className="mr-1" />
            Add Time Column
          </Button>
        </PopoverTrigger>
        <PopoverContent className="z-100 p-3 flex flex-col gap-4 items-center bg-white shadow shadow-black/25 rounded-xl" sideOffset={4}>
          <h1 className="font-semibold text-lg">New Time Column</h1>
          <TimeOffsetInput
            idPrefix="lab-time-column"
            value={timeOffset}
            onChange={setTimeOffset}
            direction="before"
          />
          <div className={`rounded-md p-2.5 text-xs flex items-start gap-2 border  border-blue-200 text-blue-700`}>
            <Info className="size-4 shrink-0" />
            <p>
              <span>Data will appear as if entered <strong>{days || 0}d {hours || 0}h {minutes || 0}m</strong> prior to the start of simulation.</span>
            </p>
          </div>
          <Button
            type='button'
            onClick={() => onColumnAdd(timeOffset ?? 0)}
            className="w-full shadow bg-blue-600 hover:bg-blue-700 font-medium"
          >
            Insert Time Column
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}