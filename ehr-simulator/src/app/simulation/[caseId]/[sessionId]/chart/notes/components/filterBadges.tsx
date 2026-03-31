import { Trash, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface filterBadgesProps {
    activeFilters: string[];
    handleFilterChange: (title: string, checked: boolean) => void;
    handleClearFilters: () => void
}

const FilterBadges = ({ activeFilters, handleFilterChange, handleClearFilters }: filterBadgesProps) => {

    return (
        <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
                <Badge
                    key={`${filter}-${index}`}
                    variant="outline"
                    className="flex h-6 items-center gap-1 pl-2 pr-1.5 bg-white"
                >
                    {filter}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleFilterChange(filter, false)}
                    >
                        <X className="size-4" />
                    </Button>

                </Badge>
            ))}
            {activeFilters.length > 0 && (
                <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs h-6 border bg-white shadow group"
                    onClick={handleClearFilters}
                >
                    <Trash className="group-hover:fill-red-200" />
                    Clear all
                </Button>
            )}
        </div>
    );
};

export default FilterBadges