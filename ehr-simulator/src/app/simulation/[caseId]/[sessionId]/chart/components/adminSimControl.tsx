import { Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import InfoTooltip from "@/components/helpTooltip";

interface AdminSimControlProps {
  isPresim: boolean;
  onPresimChange: () => void;
}

export default function AdminSimControl({
  isPresim,
  onPresimChange
}: AdminSimControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const handlePresimChange = () => {
    onPresimChange();
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <InfoTooltip content="Simulation Controls">
        <PopoverTrigger asChild>
          <Button variant="secondary" className="p-0 size-7! hover:text-blue-600 hover:ring-2">
            <SkipForward className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </InfoTooltip>

      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-sm font-semibold leading-none">Simulation Controls</h1>
            <p className="text-xs text-muted-foreground">
              Toggle between pre-simulation and active simulation mode.
            </p>
          </div>

          <div className="grid gap-4 pt-2 border-t">
            <Button
              variant={isPresim ? "default" : "secondary"}
              size="sm"
              onClick={handlePresimChange}
            >
              {isPresim ? (
                <>
                  <Play className="mr-1 size-3" />
                  Active Sim
                </>
              ) : (
                <>
                  <RotateCcw className="mr-1 size-3" />
                  Presim
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
