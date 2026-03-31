import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectTrigger, SelectItem, SelectGroup, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label";

interface AssessmentSelectProps {
  options: string[];
  value: string;
  onValueChange: (newValue: string) => void;
  className?: string;
  label: string;
}


export default function MedAdminCardSelector({
  options,
  value,
  onValueChange,
  label
}: AssessmentSelectProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange} >
        <SelectTrigger className="">
          <SelectValue className="text-xs w-full">
            {value}
          </SelectValue>
          <ChevronDown />
        </SelectTrigger>
        <SelectContent className="">
          <SelectGroup className="p-0 ">
            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className=""
              >
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}