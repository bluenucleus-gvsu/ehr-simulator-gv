/**
 * TEMP dev bypass: treat a hardcoded email as faculty (login redirect + client role).
 *
 * Revert:
 * 1. Set DEV_FACULTY_BYPASS_ENABLED=false and NEXT_PUBLIC_DEV_FACULTY_BYPASS_ENABLED=false, or
 * 2. Delete this file and remove imports from resolveAuthRole.ts / callers.
 */
export const DEV_FACULTY_HARDCODED_EMAIL = "bilalniazikhanzada@gmail.com";

export function isDevFacultyBypassEnabled(): boolean {
  const raw =
    process.env.DEV_FACULTY_BYPASS_ENABLED ??
    process.env.NEXT_PUBLIC_DEV_FACULTY_BYPASS_ENABLED ??
    "false";
  return ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase());
}

export function emailIsDevFacultyAllowlist(email: string | undefined): boolean {
  if (!isDevFacultyBypassEnabled()) return false;
  if (!email) return false;
  return email.trim().toLowerCase() === DEV_FACULTY_HARDCODED_EMAIL.toLowerCase();
}
