import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerSupabase } from "@/utils/supabase/server";

export default async function Home() {

  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const id = user?.id;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Link href={`/user/profile/${id}`} passHref className="p-4">
        <Button>My Profile</Button>
      </Link>
      <Link href="/admin" passHref>
        <Button>Admin Portal</Button>
      </Link>
    </div>
  );
}
