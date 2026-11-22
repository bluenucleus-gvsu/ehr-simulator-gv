import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button";
interface SubmitButtonProps {
  buttonText: string;
  onClick: () => void;
  tooltip?: string;
}

const BackButton = ({ buttonText, onClick, tooltip }: SubmitButtonProps) => {
  return (
    <div className="flex flex-col gap-2 w-fit">
      <Button
        className="w-full cursor-pointer bg-gray-100 hover:bg-gray-200 shadow-xs"
        variant={"secondary"}
        onClick={onClick}
        title={tooltip}
      >
        <ArrowLeft /> {buttonText}
      </Button>
    </div>
  )
}

export default BackButton