import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { emailIsDevFacultyAllowlist } from "@/lib/devFacultyEmails";

/** Tester > dev faculty > dev admin > DB/metadata role. */
export function resolveAuthRole(
  email: string | undefined,
  options: {
    isTesterLogin?: boolean;
    dbOrMetadataRole?: string | null;
  },
): string | undefined {
  if (options.isTesterLogin) return "tester";
  if (emailIsDevFacultyAllowlist(email)) return "faculty";
  if (emailIsDevAdminAllowlist(email)) return "admin";
  return options.dbOrMetadataRole || undefined;
}
