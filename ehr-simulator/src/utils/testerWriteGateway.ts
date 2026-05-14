import { isTesterModeServer } from "@/utils/testerModeServer";

export async function runWriteForMode<T>(
  liveWrite: () => Promise<T>,
  testerWrite: () => Promise<T>,
): Promise<T> {
  const testerMode = await isTesterModeServer();
  if (testerMode) return testerWrite();
  return liveWrite();
}
