import { Select, SelectContent, SelectTrigger, SelectItem, SelectGroup, SelectValue } from "@/components/ui/select"    
import { type chartingOptions} from "./flexSheetData"
import { cn, } from "@/lib/utils"


interface AssessmentSelectProps {
    options: chartingOptions[];
    value: string;
    onValueChange: (newValue: string) => void;
    rowId: string;
    columnId: string;
    className?: string;
}
export default function AssessmentSelect({ 
    options,
    value,
    onValueChange,
    className,
}: AssessmentSelectProps) {
    return(
        <div className={cn("flex items-center h-6 w-full", className)}>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="h-6 w-full focus-visible:ring-0 py-0 px-2 justify-end text-xs rounded-none shadow-none border-0">
                    <SelectValue className="text-xs w-full">
                        {value}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="">
                    <SelectGroup className="p-0 ">
                        {options.map((option) => (
                            <SelectItem 
                                key={option.subsetId}
                                value={option.subsetId}
                                className="w-full text-xs h-6 m-0 border-b first:focus:rounded-2xl last:border-b-0 rounded-none"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
)}