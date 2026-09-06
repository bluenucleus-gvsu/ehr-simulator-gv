import { useState } from "react";
import { ChevronsLeft, ChevronsRight, SkipForward, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import InfoTooltip from "@/components/helpTooltip";

interface AdminSimControlProps {
  isPresim: boolean;
  currentPhase: number;
  onPhaseChange: (phase: number) => void;
  onPresimChange: () => void;
}

export default function AdminSimControl({
  isPresim,
  currentPhase,
  onPhaseChange,
  onPresimChange
}: AdminSimControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePhaseChange = (offset: number) => {
    if (currentPhase + offset > 0) {
      onPhaseChange(currentPhase + offset);
    }
  };

  const handlePresimChange = () => {
    onPhaseChange(1);
    onPresimChange();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <InfoTooltip content="Phase Controls">
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
              Adjust phase or toggle simulation mode. Set to &quot;Active Sim&quot; to change Phase.
            </p>
          </div>

          <div className="grid gap-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Phase</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handlePhaseChange(-1)}
                  disabled={currentPhase === 1}
                >
                  <ChevronsLeft className="size-4" />
                </Button>

                <span className="w-6 text-center text-sm font-semibold">
                  {currentPhase}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handlePhaseChange(1)}
                  disabled={isPresim}
                >
                  <ChevronsRight className="size-4" />
                  <span className="sr-only">Increase phase</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">State</span>
              <Button
                variant={isPresim ? "default" : "secondary"}
                size="sm"
                className="h-7 text-xs"
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
        </div>
      </PopoverContent>
    </Popover>
  );
}