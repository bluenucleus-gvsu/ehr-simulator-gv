"use client"

import React, { useState, useMemo } from 'react';
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { chartingOptions } from "./flexSheetData";

interface CheckBoxListProps {
  options: chartingOptions[];
  selectedOptions: string[]; // These are now strictly IDs!
  rowId: string;
  columnId: string;
  onSelectionChange: (rowId: string, columnId: string, selectedValues: string[]) => void;
}

const CheckBoxList: React.FC<CheckBoxListProps> = ({
  options,
  selectedOptions,
  rowId,
  onSelectionChange,
  columnId,
}) => {
  // Only track the IDs in state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedOptions));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Dynamically calculate the labels for the button display
  const displayLabels = useMemo(() => {
    return options
      .filter(opt => selectedIds.has(opt.subsetId))
      .map(opt => opt.label)
      .join(', ');
  }, [selectedIds, options]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newIdSet = new Set(prev);
      if (checked) {
        newIdSet.add(id);
      } else {
        newIdSet.delete(id);
      }
      return newIdSet;
    });
  };

  const handleApplyClick = () => {
    onSelectionChange(rowId, columnId, Array.from(selectedIds));
    setIsPopoverOpen(false);
  };

  const handleCancelClick = () => {
    // Revert to the parent's current selections and close. 
    setSelectedIds(new Set(selectedOptions));
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild className='justify-start w-full gap-0 !h-6'>
        <Button className="h-full w-full rounded-none px-2 overflow-hidden bg-transparent shadow-none hover:bg-muted/30 font-normal text-xs text-black">
          {displayLabels || ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full bg-white p-0 m-0 shadow-md shadow-black/30 border rounded-xl overflow-hidden">
        <div className="">
          {options.map((option) => {
            const isWDLExcept = option.label === "WDL, except:";

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
                    onCheckedChange={(checked) => handleCheckboxChange(option.subsetId, checked as boolean)}
                    className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:text-white "
                  />
                  <p className="text-xs text-left leading-none font-normal">
                    {option.label}
                  </p>
                </Label>
              )
            } else {
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