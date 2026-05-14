export const TESTER_MODE_COOKIE = "ehr_tester_mode";
export const TESTER_MODE_EXPIRY_COOKIE = "ehr_tester_mode_expires_at";
export const TESTER_TARGET_COOKIE = "ehr_tester_target";
export const TESTER_MODE_TTL_MS = 1000 * 60 * 60 * 12;

export function isTesterRole(role: string | null | undefined): boolean {
  return role === "tester";
}

export function setTesterModeCookies(enabled: boolean, ttlMs: number = TESTER_MODE_TTL_MS) {
  if (typeof document === "undefined") return;

  if (!enabled) {
    document.cookie = `${TESTER_MODE_COOKIE}=0; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${TESTER_MODE_EXPIRY_COOKIE}=0; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${TESTER_TARGET_COOKIE}=0; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  const expiresAt = Date.now() + ttlMs;
  const maxAge = Math.floor(ttlMs / 1000);
  document.cookie = `${TESTER_MODE_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `${TESTER_MODE_EXPIRY_COOKIE}=${expiresAt}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearTesterMode() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("role");
  }
  setTesterModeCookies(false);
}

export function isTesterModeClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${TESTER_MODE_COOKIE}=1`));
}

export function setTesterTarget(target: "admin" | "user") {
  if (typeof document === "undefined") return;
  document.cookie = `${TESTER_TARGET_COOKIE}=${target}; path=/; max-age=${Math.floor(TESTER_MODE_TTL_MS / 1000)}; SameSite=Lax`;
}

export function getTesterTargetClient(): "admin" | "user" {
  if (typeof document === "undefined") return "user";
  const cookie = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((part) => part.startsWith(`${TESTER_TARGET_COOKIE}=`));
  if (!cookie) return "user";
  const value = cookie.split("=")[1];
  return value === "admin" ? "admin" : "user";
}

export function getTesterExpiryClient(): number | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((part) => part.startsWith(`${TESTER_MODE_EXPIRY_COOKIE}=`));
  if (!cookie) return null;
  const value = Number(cookie.split("=")[1]);
  return Number.isFinite(value) ? value : null;
}
