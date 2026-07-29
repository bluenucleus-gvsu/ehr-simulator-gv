
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ReactNode } from "react"

interface InfoTooltipProps {
  content: string,
  children: ReactNode
}

const InfoTooltip = ({ content, children }: InfoTooltipProps) => {

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button" asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="w-fit">
          <p className="max-w-120 text-wrap">
            {content}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default InfoTooltip