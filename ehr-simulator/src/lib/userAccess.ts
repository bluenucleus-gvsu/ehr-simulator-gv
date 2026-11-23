import type { User } from "@supabase/supabase-js";
import { getUserRole } from "@/actions/users";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import type { UserRole } from "@/lib/userManagement";
import { createServerSupabase } from "@/utils/supabase/server";

export type AuthUser = {
  user: User | null;
  role: UserRole | null;
  isDevAdmin: boolean;
  lookupFailed: boolean;
};

export const getAuthUser = async (): Promise<AuthUser> => {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    if (!user) {
      return { user: null, role: null, isDevAdmin: false, lookupFailed: false };
    }

    const role = (await getUserRole(user.id)) as UserRole | null;
    return {
      user,
      role,
      isDevAdmin: emailIsDevAdminAllowlist(user.email ?? undefined),
      lookupFailed: false,
    };
  } catch {
    return { user: null, role: null, isDevAdmin: false, lookupFailed: true };
  }
};
