import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface TooltipProps {
  color: string;
  tip: string;
  size: number;
}

const FormTooltip = ({ color, tip, size }: TooltipProps) => {

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info size={size} color={color} />
        </TooltipTrigger>
        <TooltipContent className="w-fit">
          <p className="max-w-120 text-wrap">{tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default FormTooltip
