"use client"

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
interface SubmitButtonProps {
  buttonText: string;
  onClick: () => void | Promise<void>;
  tooltip?: string;
}

const ContinueButton = ({ buttonText, onClick, tooltip }: SubmitButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleClick = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onClick();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The case could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="">
      <Button
        className="w-full cursor-pointer"
        variant={"default"}
        onClick={() => void handleClick()}
        disabled={isSaving}
        title={tooltip}
      >
        {isSaving ? "Saving…" : buttonText}
        {isSaving ? <Loader2 className="animate-spin" /> : <ArrowRight />}
      </Button>
    </div>
  )
}

export default ContinueButton
