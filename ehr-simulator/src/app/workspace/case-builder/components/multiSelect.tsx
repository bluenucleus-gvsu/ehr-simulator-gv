import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options?: Option[];
  labelText: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>
}

export function MultiSelect({
  options = [],
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  labelText,
  selectedValues,
  setSelectedValues
}: MultiSelectProps) {

  const [open, setOpen] = useState<boolean>(false);
  // Internal state manages the selection (Uncontrolled pattern)

  const handleSelect = (currentValue: string): void => {
    if (!selectedValues.includes(currentValue)) {
      const newValues = [...selectedValues, currentValue];
      setSelectedValues(newValues);
    }
    // Keep popover open for multiple selections, or close if you prefer: setOpen(false);
  };

  const handleRemove = (valueToRemove: string): void => {
    const newValues = selectedValues.filter((value) => value !== valueToRemove);
    setSelectedValues(newValues);
  };

  // Filter out already selected items from the list
  const availableOptions = options.filter(
    (option) => !selectedValues.includes(option.value)
  );

  return (
    <div className="w-full">
      <label className="text-xs font-medium text-slate-500 mb-1.5 block uppercase tracking-wide">
        {labelText}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white h-9 font-normal text-slate-700 hover:bg-slate-50 border-slate-200"
          >
            {selectedValues.length > 0
              ? <span className="text-slate-900 font-medium">{selectedValues.length} selected</span>
              : <span className="text-slate-400">{placeholder}</span>
            }
            <ChevronsUpDown className="ml-2 shrink-0 opacity-50 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {availableOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Badge Display Area */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedValues.map((value) => {
            const option = options.find((o) => o.value === value);
            const label = option ? option.label : value;

            return (
              <Badge
                key={value}
                variant="outline"
                className="pl-2.5 pr-1 py-1 h-7 text-sm font-normal bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1 hover:bg-slate-100 transition-colors"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemove(value)}
                  className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                  aria-label={`Remove ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}