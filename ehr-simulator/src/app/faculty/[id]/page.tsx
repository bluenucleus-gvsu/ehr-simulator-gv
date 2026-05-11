import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/utils/supabase/server";
import FacultyHeader from "@/app/faculty/components/FacultyHeader";
import FacultyCoursesView, { Course } from "@/app/faculty/components/FacultyCoursesView";

// ─── Dummy data (replace with real DB calls later) ───────────────────────────
function getDummyCourses(): Course[] {
  // Use a fixed "today" date string so it always shows the Start Simulation button
  // In production this will come from the DB
  const todayISO = new Date().toISOString().split("T")[0];

  return [
    {
      id: "c1",
      code: "NRS 310",
      name: "Clinical Simulation I",
      active: true,
      sections: [
        {
          id: "sec1",
          name: "Section A – MWF 9:00 AM",
          simulations: [
            {
              id: "sim1",
              caseName: "Cardiac Assessment – John Doe",
              simTime: `${todayISO}T10:00:00`,
              groups: [
                {
                  id: "g1",
                  name: "Group 1",
                  members: [
                    { id: "s1", name: "Alice Johnson" },
                    { id: "s2", name: "Bob Smith" },
                    { id: "s3", name: "Carol White" },
                  ],
                },
                {
                  id: "g2",
                  name: "Group 2",
                  members: [
                    { id: "s4", name: "David Brown" },
                    { id: "s5", name: "Emma Davis" },
                    { id: "s6", name: "Frank Miller" },
                  ],
                },
              ],
            },
            {
              id: "sim2",
              caseName: "Respiratory Distress – Jane Smith",
              simTime: "2026-03-25T14:00:00",
              groups: [
                {
                  id: "g3",
                  name: "Group 1",
                  members: [
                    { id: "s1", name: "Alice Johnson" },
                    { id: "s2", name: "Bob Smith" },
                  ],
                },
                {
                  id: "g4",
                  name: "Group 2",
                  members: [
                    { id: "s4", name: "David Brown" },
                    { id: "s5", name: "Emma Davis" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "c2",
      code: "NRS 410",
      name: "Advanced Clinical Simulation",
      active: true,
      sections: [
        {
          id: "sec2",
          name: "Section B – TTh 2:00 PM",
          simulations: [
            {
              id: "sim3",
              caseName: "Post-Op Patient – Mary Johnson",
              simTime: "2026-03-22T09:00:00",
              groups: [
                {
                  id: "g5",
                  name: "Group A",
                  members: [
                    { id: "s7", name: "Grace Lee" },
                    { id: "s8", name: "Henry Wilson" },
                    { id: "s9", name: "Isabella Chen" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "c3",
      code: "NRS 210",
      name: "Fundamentals of Nursing",
      active: false,
      sections: [
        {
          id: "sec3",
          name: "Section A – Spring 2025",
          simulations: [
            {
              id: "sim4",
              caseName: "Fall Risk Assessment – Tom Brown",
              simTime: "2025-11-15T10:00:00",
              groups: [
                {
                  id: "g6",
                  name: "Group 1",
                  members: [
                    { id: "s10", name: "Jack Thompson" },
                    { id: "s11", name: "Karen White" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}
// ─────────────────────────────────────────────────────────────────────────────

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

  const courses = getDummyCourses();
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
