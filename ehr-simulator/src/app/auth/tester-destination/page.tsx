"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { setTesterTarget } from "@/utils/testerMode";

export default function TesterDestinationPage() {
  const router = useRouter();

  const goToTarget = async (target: "admin" | "user") => {
    setTesterTarget(target);
    if (target === "admin") {
      router.replace("/admin");
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) {
      router.replace("/auth/login");
      return;
    }
    router.replace(`/user/profile/${userId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Choose Tester Destination</h1>
      <p className="text-sm text-slate-600">You are signed in as tester. Pick which side to open.</p>
      <div className="flex gap-3">
        <button
          onClick={() => goToTarget("admin")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go to Admin Side
        </button>
        <button
          onClick={() => goToTarget("user")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Go to User Side
        </button>
      </div>
    </div>
  );
}
