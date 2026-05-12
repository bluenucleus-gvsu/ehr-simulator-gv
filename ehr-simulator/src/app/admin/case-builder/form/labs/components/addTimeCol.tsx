"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AddTimeColumnButtonProps {
  handleColumnAdd: (time: number) => void;
}

export function AddTableColumn({ handleColumnAdd }: AddTimeColumnButtonProps) {
  const [days, setDays] = useState<number | ''>('');
  const [hours, setHours] = useState<number | ''>('');
  const [minutes, setMinutes] = useState<number | ''>('');

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const timeOffset = -1 * (((days || 0) * 24 * 60) + ((hours || 0) * 60) + (minutes || 0))

  const handleTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (x: number | '') => void
  ) => {
    const inputValue = event.target.value;
    if (inputValue === '') {
      setter('');
      return
    }
    const numValue = parseFloat(inputValue);

    if (!isNaN(numValue) && numValue >= 0 && numValue <= 99999999) {
      setter(numValue);
    }
  };

  const onColumnAdd = (offset: number) => {
    setIsPopoverOpen(false);
    handleColumnAdd(offset);
    setDays('');
    setHours('');
    setMinutes('');
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
          <div className="flex gap-3">
            <div>
              <Label htmlFor='days' className="text-xs font-semibold pb-1">Days</Label>
              <Input id='days' value={days} onChange={(e) => handleTimeChange(e, setDays)} className=" p-0.5 text-center" />
            </div>
            <div>
              <Label htmlFor='hours' className="text-xs font-semibold pb-1">Hours</Label>
              <Input id='hours' value={hours} onChange={(e) => handleTimeChange(e, setHours)} className=" p-0.5 text-center" />
            </div>
            <div>
              <Label htmlFor='minutes' className="text-xs font-semibold pb-1">Minutes</Label>
              <Input id='minutes' value={minutes} onChange={(e) => handleTimeChange(e, setMinutes)} className=" p-0.5 text-center" />
            </div>
          </div>
          <div className={`rounded-md p-2.5 text-xs flex items-start gap-2 border  border-blue-200 text-blue-700`}>
            <Info className="size-4 shrink-0" />
            <p>
              <span>Data will appear as if entered <strong>{days || 0}d {hours || 0}h {minutes || 0}m</strong> prior to the start of simulation.</span>
            </p>
          </div>
          <Button
            type='button'
            onClick={() => onColumnAdd(timeOffset)}
            className="w-full shadow bg-blue-600 hover:bg-blue-700 font-medium"
          >
            Insert Time Column
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}