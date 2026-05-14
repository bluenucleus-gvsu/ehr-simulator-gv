"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  clearTesterMode,
  getTesterExpiryClient,
  getTesterTargetClient,
  isTesterModeClient,
  setTesterTarget,
} from "@/utils/testerMode";
import { createBrowserClient } from "@supabase/ssr";
import { clearTesterLocalStore } from "@/utils/testerLocalStore";

function formatMs(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function readTesterBannerState() {
  return {
    isTester: isTesterModeClient(),
    target: getTesterTargetClient(),
  };
}

export default function TesterSessionBanner() {
  const pathname = usePathname();
  const [now, setNow] = useState(Date.now());
  const [isTester, setIsTester] = useState(false);
  const [target, setTarget] = useState<"admin" | "user">("user");
  const expiry = useMemo(() => getTesterExpiryClient(), [now]);

  /** Before paint on client to avoid a long “missing banner” flash after hard navigations. */
  useLayoutEffect(() => {
    const { isTester: on, target: t } = readTesterBannerState();
    setIsTester(on);
    setTarget(t);
  }, []);

  useEffect(() => {
    const { isTester: on, target: t } = readTesterBannerState();
    setIsTester(on);
    setTarget(t);
  }, [pathname]);

  useEffect(() => {
    const onVisible = () => {
      const { isTester: on, target: t } = readTesterBannerState();
      setIsTester(on);
      setTarget(t);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isTester || !expiry) return;
    if (Date.now() > expiry) {
      clearTesterLocalStore();
      clearTesterMode();
      window.location.href = "/auth/login";
    }
  }, [isTester, expiry, now]);

  if (!isTester) return null;

  const timeLeft = expiry ? formatMs(expiry - now) : "Unknown";

  return (
    <div className="sticky top-0 z-[200] w-full bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm flex items-center justify-between">
      <span>
        Tester mode is local-only ({target} side). Session auto-reset in <strong>{timeLeft}</strong>.
      </span>
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={async () => {
            const nextTarget = target === "admin" ? "user" : "admin";
            setTesterTarget(nextTarget);
            setTarget(nextTarget);
            if (nextTarget === "admin") {
              window.location.href = "/admin";
              return;
            }
            const supabase = createBrowserClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            );
            const { data } = await supabase.auth.getUser();
            const userId = data.user?.id;
            window.location.href = userId ? `/user/profile/${userId}` : "/auth/login";
          }}
        >
          Switch to {target === "admin" ? "User" : "Admin"} Side
        </button>
        <button
          className="px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
          onClick={() => {
            clearTesterLocalStore();
            clearTesterMode();
            window.location.href = "/auth/login";
          }}
        >
          Reset Tester Data Now
        </button>
      </div>
    </div>
  );
}
