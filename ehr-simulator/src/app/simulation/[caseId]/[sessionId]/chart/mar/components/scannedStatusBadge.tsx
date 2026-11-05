import { Badge } from "@/components/ui/badge"
import { UserCheck, UserX } from "lucide-react"

// Helper for wristband scan badge
export const PatientStatusBadge = ({ isScanned }: { isScanned: boolean }) => {
  if (isScanned) {
    return (
      <Badge className="text-emerald-700 h-6  border-emerald-700 bg-emerald-50 rounded-xl gap-2 text-sm font-normal">
        <UserCheck className="size-4!" />
        Scanned
      </Badge>
    )
  }
  return (
    <Badge className="text-red-700 h-6 border-red-700 bg-red-50 rounded-xl gap-2 text-sm font-normal">
      <UserX className="size-4!" />
      Not Scanned
    </Badge>
  )
};