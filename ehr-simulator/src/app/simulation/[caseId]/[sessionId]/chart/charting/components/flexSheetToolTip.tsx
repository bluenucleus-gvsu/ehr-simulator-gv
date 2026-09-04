import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChartingToopTipProps {
  field: string;
  descriptions: { assessment: string; description: string; }[];
}

export function ChartingToolTip({ field, descriptions }: ChartingToopTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger className="px-2 font-medium text-xs text-lime-900 text-left">
        {field}
      </TooltipTrigger>
      <TooltipContent className="bg-white shadow shadow-black/30 rounded-xl ml-4 py-3 px-4 z-51 max-w-sm">
        <h1 className="text-sm font-bold text-black">WDL Criteria</h1>
        <div className="space-y-2">
          {descriptions.map((row, index) => (
            <div key={index}>
              <p className="pl-2 text-xs font-semibold text-gray-800 text-wrap">{row.assessment}:</p>
              <p className="pl-4 text-xs text-gray-600 italic text-wrap">{row.description}</p>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}