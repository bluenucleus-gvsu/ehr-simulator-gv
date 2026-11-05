import type { Database } from "@/../database.types";
import { addMinutes, format } from "date-fns";


type MedAdministrationViewRow = Database["public"]["Views"]["all_medication_administrations"]["Row"];
type AdminTimeLike = Pick<MedAdministrationViewRow, "status" | "time_offset"> & {
  adminTimeMinuteOffset?: number;
};

export function LastAdministrationTime(administrations: AdminTimeLike[], sessionStartTime: Date) {
  if (!administrations || administrations.length === 0) {
    return (
      <div className="flex w-full justify-end gap-2 pr-4">
        <p className="text-sm">Last Administered:</p>
        <p className="text-sm font-light">Never</p>
      </div>
    )
  }
  const filteredAdmins = administrations.filter((admin) => admin.status === "Given")

  if (filteredAdmins.length !== 0) {
    const lastAdmin = filteredAdmins.reduce((latest, current) => {
      const currentOffset = current.adminTimeMinuteOffset ?? current.time_offset ?? Number.NEGATIVE_INFINITY;
      const latestOffset = latest.adminTimeMinuteOffset ?? latest.time_offset ?? Number.NEGATIVE_INFINITY;
      return currentOffset > latestOffset ? current : latest;
    })
    const lastAdminOffset = lastAdmin.adminTimeMinuteOffset ?? lastAdmin.time_offset ?? 0;
    const lastAdminDate = addMinutes(sessionStartTime, lastAdminOffset);
    const lastAdminTime = format(lastAdminDate, 'HHmm')
    const lastAdminDay = format(lastAdminDate, 'LL/dd')
    return (
      <div className="flex w-full justify-end items-end gap-2 pr-4">
        <p className="text-sm">Last Administered:</p>
        <div className="grid place-items-center">
          <p className="text-xs font-medium underline">{lastAdminDay}</p>
          <p className="text-sm font-mono tracking-tight">{lastAdminTime}</p>
        </div>
      </div>

    )
  }
  return (
    <div className="flex w-full justify-end gap-2 pr-4">
      <p className="text-sm">Last Administered:</p>
      <p className="text-sm font-light">Never</p>
    </div>
  )
};