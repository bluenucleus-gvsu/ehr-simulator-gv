/**
 * Comma-separated emails in DEV_ADMIN_EMAILS and/or NEXT_PUBLIC_DEV_ADMIN_EMAILS (.env.local).
 * NEXT_PUBLIC_* is required for client components; server reads both.
 * Gate with DEV_ADMIN_BYPASS_ENABLED / NEXT_PUBLIC_DEV_ADMIN_BYPASS_ENABLED for easy rollback.
 */
export function isDevAdminBypassEnabled(): boolean {
  const raw =
    process.env.DEV_ADMIN_BYPASS_ENABLED ??
    process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS_ENABLED ??
    "false"
  return ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase())
}

export function emailIsDevAdminAllowlist(email: string | undefined): boolean {
  if (!isDevAdminBypassEnabled()) return false
  if (!email) return false
  const raw = process.env.DEV_ADMIN_EMAILS || process.env.NEXT_PUBLIC_DEV_ADMIN_EMAILS
  if (!raw) return false
  const allow = new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )
  return allow.has(email.toLowerCase())
}
