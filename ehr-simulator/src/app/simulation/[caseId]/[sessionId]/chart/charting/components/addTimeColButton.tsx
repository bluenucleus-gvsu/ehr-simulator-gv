"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { differenceInMinutes } from "date-fns";

interface AddTimeColumnButtonProps {
    onColumnAdd: (timeString: number) => void;
    existingTimeColumns: number[];
    sessionStartTime: number | null;
}

export function AddTimeColumnButton({ onColumnAdd, existingTimeColumns, sessionStartTime }: AddTimeColumnButtonProps) {
    const [simulationTime] = useState(new Date().getTime());

    const [selectedTime, setSelectedTime] = useState<Date | undefined>(new Date());
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

    const handleAddTime = () => {
        if (!simulationTime || !sessionStartTime) {
            return
        }
        const timeOffset = differenceInMinutes(sessionStartTime, simulationTime)

        if (existingTimeColumns.includes(timeOffset)) {
            toast.error(`Time at ${timeOffset} already exists`, {
                description: "Please choose a different time or use an existing column.",
            });
            return;
        }

        onColumnAdd(timeOffset);
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
        const timeOffset = differenceInMinutes(sessionStartTime, selectedTime.getTime())

        if (existingTimeColumns.includes(timeOffset)) {
            toast.error(`Time at ${timeOffset} already exists`, {
                description: "Please choose a different time or use an existing column.",
            });
            return;
        }

        onColumnAdd(timeOffset);
        setIsPopoverOpen(false);
        setSelectedTime(new Date());
    }

    return (
        <div className="flex gap-4 pl-8">
            <Button onClick={handleAddTime} className="bg-white h-6 text-black text-xs hover:bg-gray-100 shadow">
                <Plus className="" />
                Add Time
            </Button>

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button className="bg-white h-6 text-black text-xs hover:bg-gray-100 shadow shadow-black/20">
                        <Clock className="mr-1" />
                        Insert Time
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="z-3 p-3 flex flex-col bg-white shadow shadow-black/25 rounded-xl" sideOffset={4}>
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