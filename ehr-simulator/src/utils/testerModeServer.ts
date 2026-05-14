import { cookies } from "next/headers";
import { TESTER_MODE_COOKIE, TESTER_MODE_EXPIRY_COOKIE } from "@/utils/testerMode";

export async function isTesterModeServer(): Promise<boolean> {
  const cookieStore = await cookies();
  const enabled = cookieStore.get(TESTER_MODE_COOKIE)?.value === "1";
  const expiresRaw = cookieStore.get(TESTER_MODE_EXPIRY_COOKIE)?.value;
  const expiresAt = expiresRaw ? Number(expiresRaw) : NaN;

  if (!enabled) return false;
  if (Number.isFinite(expiresAt) && Date.now() > expiresAt) return false;
  return true;
}
