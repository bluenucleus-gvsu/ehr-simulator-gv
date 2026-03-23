"use client"

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button"; // Make sure Button is imported
import { Checkbox } from "@/components/ui/checkbox";
import type { chartingOptions } from "./flexSheetData";

interface CheckBoxListProps {
    options: chartingOptions[]; // The list of available checkboxes (e.g., WDL, Lung Sounds)
    selectedOptions: string[]; // The currently selected options (values) from the parent
    rowId: string;
    columnId: string;
    onSelectionChange: (rowId: string, columnId: string, selectedValues: string[]) => void; // Callback to notify parent of changes
}

const CheckBoxList: React.FC<CheckBoxListProps> = ({ 
    options,
    selectedOptions,
    rowId,
    onSelectionChange,
    columnId,
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedOptions));
    // Local state to manage the checkboxes within the popover
    const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set(selectedOptions));
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleCheckboxChange = (id: string, label: string, checked: boolean) => {
        setSelectedIds(prev => {
            const newIdSet = new Set(prev);
            if (checked) {
                newIdSet.add(id);
            } else {
                newIdSet.delete(id);
            }
            return newIdSet;
        });
        setSelectedLabels(prev => {
            const newLabelSet = new Set(prev);
            if (checked) {
                newLabelSet.add(label);
            } else {
                newLabelSet.delete(label);
            }
            return newLabelSet;
        })
    };

    const handleApplyClick = () => {
        // When the "Apply" button is clicked, notify the parent of the final selections
        onSelectionChange(rowId, columnId, Array.from(selectedLabels));
        setIsPopoverOpen(false); // Close the popover after applying
    };

    const handleCancelClick = () => {
        // If "Cancel" is clicked, revert to the parent's current selections and close. Does not update labels yet though..
        setSelectedIds(new Set(selectedOptions));
        setIsPopoverOpen(false);
    };

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}> 
            <PopoverTrigger asChild className='justify-start w-full gap-0 px-0 lg:h-6'>
                <Button className="h-6 w-full rounded-none px-2 overflow-hidden bg-transparent shadow-none hover:bg-muted/30 font-normal text-xs text-black">
                    {[...selectedLabels].join(', ') || ""}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full bg-white p-0 shadow-md shadow-black/30 border rounded-xl overflow-hidden">
                <div className="">
                    {options.map((option) => {
                        const isWDLExcept = option.label === "WDL, except:"

                        if (!isWDLExcept) {
                            const checkboxId = `checkbox-${rowId}-${columnId}-${option.subsetId}`;

                            return (
                                <Label
                                    htmlFor={checkboxId}
                                    key={`label-${rowId}-${columnId}-${option.subsetId}`}
                                    className="hover:bg-accent/50 flex items-left gap-3 border-b p-2 last:border-b-0 has-[[aria-checked=true]]:bg-blue-50 "
                                >
                                    <Checkbox
                                        id={checkboxId}
                                        checked={selectedIds.has(option.subsetId)}
                                        onCheckedChange={(checked) => handleCheckboxChange(option.subsetId, option.label, checked as boolean)}
                                        className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:text-white "
                                    />
                                    <p className="text-xs text-left leading-none font-normal">
                                        {option.label}
                                    </p>
                                </Label>
                            )
                        } else {
                            // WDL option does not correspond to any rows to open
                            return (
                                <Label 
                                    className='h-8 pl-4 border-b bg-gray-100 text-xs text-left leading-none font-normal'
                                    key={`wdl-except-${rowId}-${columnId}`}
                                >
                                    WDL, except:
                                </Label>
                            )
                        }
                    })}
                </div>
                <div className="flex justify-center gap-2 p-2 border-t"> 
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelClick}
                        className='text-xs py-1 px-2 h-6'
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApplyClick}
                        className='text-xs py-1 px-2 h-6 shadow shadow-black/25 bg-lime-600 hover:bg-lime-700'
                    >
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default CheckBoxList;