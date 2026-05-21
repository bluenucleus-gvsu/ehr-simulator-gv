"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { differenceInMinutes } from "date-fns";
import { formatTimeFromOffset } from "../components/flexSheetHelpers";

interface AddTimeColumnButtonProps {
    onColumnAdd: (timeString: number) => void;
    existingTimeColumns: number[];
    sessionStartTime: number | null;
    disabled?: boolean;
}

function handleConflictingTimes(timeOffset: number, sessionStartTime: number) {
    const timeData = formatTimeFromOffset(timeOffset, sessionStartTime)
    const date = timeData?.date || 'Unknown Date'
    const time = timeData?.time || 'Unknown Time'
    toast.error(`Column for ${date + ' at ' + time} already exists`, {
        description: "Please choose a different time or use an existing column.",
    });
}

function columnAddSuccess(timeOffset: number, sessionStartTime: number) {
    const timeData = formatTimeFromOffset(timeOffset, sessionStartTime)
    const date = timeData?.date || 'Unknown Date'
    const time = timeData?.time || 'Unknown Time'
    toast.success(`Column added at ${time + ' on ' + date}.`);
}

export function AddTimeColumnButton({ onColumnAdd, existingTimeColumns, sessionStartTime, disabled = false }: AddTimeColumnButtonProps) {
    const [selectedTime, setSelectedTime] = useState<Date | undefined>(new Date());
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

    const handleAddTime = () => {
        if (!sessionStartTime) {
            return;
        }
        const timeOffset = differenceInMinutes(new Date().getTime(), sessionStartTime)

        if (existingTimeColumns.includes(timeOffset)) {
            handleConflictingTimes(timeOffset, sessionStartTime)
            return;
        }

        onColumnAdd(timeOffset);
        columnAddSuccess(timeOffset, sessionStartTime);
    }

    const handleAddUserDefinedTime = () => {
        if (!sessionStartTime) {
            return
        }
        if (!selectedTime) {
            toast.error("Please select a time to add.", {
                description: "The time field cannot be empty.",
            });
            return;
        }
        const timeOffset = differenceInMinutes(selectedTime.getTime(), sessionStartTime)

        if (existingTimeColumns.includes(timeOffset)) {
            handleConflictingTimes(timeOffset, sessionStartTime)
            return;
        }

        onColumnAdd(timeOffset);
        columnAddSuccess(timeOffset, sessionStartTime);
        setIsPopoverOpen(false);
        setSelectedTime(new Date());
    }

    return (
        <div className="flex gap-4 pl-8">
            <Button
                onClick={handleAddTime}
                disabled={disabled}
                className="bg-white h-6 text-black text-xs hover:bg-gray-100 shadow"
            >
                <Plus className="" />
                Add Time
            </Button>

            <Popover
                open={disabled ? false : isPopoverOpen}
                onOpenChange={(open) => {
                    if (!disabled) setIsPopoverOpen(open);
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        disabled={disabled}
                        className="bg-white h-6 text-black text-xs hover:bg-gray-100 shadow shadow-black/20"
                    >
                        <Clock className="mr-1" />
                        Insert Time
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="z-15 p-3 flex flex-col bg-white shadow shadow-black/25 rounded-xl" sideOffset={4}>
                    <div className="flex justify-around">
                        <h1 className="text-center font-normal text-sm">Hours</h1>
                        <h1 className="text-center font-normal text-sm">Minutes</h1>
                    </div>
                    <div className="flex mt-2 mb-4 gap-1">
                        <TimePickerInput
                            picker={'hours'}
                            setDate={setSelectedTime}
                            date={selectedTime}
                            className="bg-gray-100/50 border border-gray-300"
                        />
                        <span>:</span>
                        <TimePickerInput
                            picker={'minutes'}
                            setDate={setSelectedTime}
                            date={selectedTime}
                            className="bg-gray-100/50 border border-gray-300"
                        />
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleAddUserDefinedTime}
                        className="w-full shadow hover:bg-neutral-200"
                    >
                        Insert Time
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}