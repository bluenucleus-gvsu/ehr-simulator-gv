import { redirect } from "next/navigation";
import { createServerSupabase } from "@/utils/supabase/server";

export default async function ProfilePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  redirect(`/user/profile/${user.id}`);
}
