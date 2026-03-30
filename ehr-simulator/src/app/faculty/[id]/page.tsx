import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/utils/supabase/server";
import FacultyHeader from "@/app/faculty/components/FacultyHeader";
import FacultyCoursesView from "@/app/faculty/components/FacultyCoursesView";
import { getFacultyCourses } from "@/actions/getFacultyCourses";

export default async function FacultyPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  let facultyName = "Faculty";
  let avatarUrl = "";

  if (user.id === id) {
    facultyName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      "Faculty";
    avatarUrl = user.user_metadata?.avatar_url || "";
  } else {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", id)
      .single();
    facultyName = profile?.full_name || profile?.email || "Faculty";
  }

  const courses = await getFacultyCourses(id);
  const courseCodes = courses.filter((c) => c.active).map((c) => c.code || c.name);

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <FacultyHeader
        name={facultyName}
        avatarUrl={avatarUrl}
        courses={courseCodes}
      />
      <FacultyCoursesView courses={courses} />
    </main>
  );
}
