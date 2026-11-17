import { redirect } from "next/navigation";
import { createServerSupabase } from "@/utils/supabase/server";
import { routes } from "@/lib/routes";

export default async function ProfilePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.auth.login.getHref());
  }

  redirect(routes.user.getHref(user.id));
}
