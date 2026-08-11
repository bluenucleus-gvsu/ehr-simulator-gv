import { notFound, redirect } from "next/navigation";
import ProfileHeader from "@/app/user/components/ProfileHeader";
import CompletedCaseCard from "@/app/user/components/CompletedCaseCard";
import AssignedCaseCard from "@/app/user/components/AssignedCaseCard";
import { createServerSupabase } from "@/utils/supabase/server";
import { getUserCourses } from "@/actions/getUserCourses";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  let studentName = "Student";
  let avatarUrl = "";

  if (user.id === id) {
    studentName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Student";
    avatarUrl = user.user_metadata?.avatar_url || "";
  } else {
    const { data: profile } = await supabase.from("users").select("full_name, email, role").eq("id", id).single();
    studentName = profile?.full_name || profile?.email || "Student";

    const profileRole = profile?.role as string | undefined;
    if (profileRole && profileRole !== "student") {
      redirect("/admin");
    }
  }

  const { activeCourses, inactiveCourses } = await getUserCourses(id);
  const allCourses = [...activeCourses, ...inactiveCourses];

  // Keep completed cases authoritative from backend session lifecycle state.
  const partitionCourses = (courses: typeof activeCourses) =>
    courses.map((c) => {
      const seen = new Set<string>();
      const dedupedCompleted = c.completed.filter((item) => {
        const k = `${item.id}|${item.completed_at ?? ""}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      return {
        ...c,
        assigned: c.assigned,
        completed: dedupedCompleted.sort(
          (a, b) => new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime()
        ),
        expired: (c.expired ?? []).sort(
          (a, b) => new Date(b.expired_at ?? 0).getTime() - new Date(a.expired_at ?? 0).getTime()
        ),
      };
    });
  const filteredActive = partitionCourses(activeCourses);
  const filteredInactive = partitionCourses(inactiveCourses);

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <ProfileHeader
        name={studentName}
        avatarUrl={avatarUrl}
        classes={allCourses.map((c) => c.code || c.name || "").filter(Boolean)}
      />

      <section>
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Active Courses</h3>
          {filteredActive.length === 0 ? (
            <div className="text-sm text-muted-foreground">No active courses.</div>
          ) : (
            <ul className="space-y-4">
              {filteredActive.map((course) => (
                <li key={course.id} className="py-2 px-3 rounded border border-transparent hover:border-slate-200">
                  <div className="font-medium mb-2">
                    {course.code ?? ""}{course.code && course.name ? " - " : ""}{course.name ?? "Unnamed Course"}
                  </div>

                  <details className="mb-2 bg-slate-50 p-2 rounded">
                    <summary className="cursor-pointer font-medium">Assigned Cases</summary>
                    <div className="mt-2">
                      {course.assigned.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No assigned cases.</div>
                      ) : (
                        <ul className="space-y-2">
                          {course.assigned.map((a) => (
                            <li key={`${a.id}:${a.session_id ?? "no-session"}`} className="text-sm">
                              <AssignedCaseCard
                                id={a.id}
                                caseId={a.case_id}
                                sessionId={a.session_id}
                                sessionStatus={a.session_status ?? null}
                                name={a.name}
                                simTime={a.sim_time}
                                presimTime={a.presim_time}
                                groupMembers={a.groupMembers}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>

                  <details className="bg-slate-50 p-2 rounded">
                    <summary className="cursor-pointer font-medium">Completed Cases</summary>
                    <div className="mt-2">
                      {course.completed.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No completed cases.</div>
                      ) : (
                        <ul className="list-disc pl-5 space-y-1">
                          {course.completed.map((s, idx) => (
                            <li key={`${course.id}:${s.id}:${s.completed_at ?? "na"}:${idx}`} className="text-sm">
                              <CompletedCaseCard
                                id={s.id}
                                name={s.name}
                                groupMembers={s.teamMembers}
                                date={s.completed_at}
                                feedback={s.feedback}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>

                  <details className="bg-slate-50 p-2 rounded mt-2">
                    <summary className="cursor-pointer font-medium">Expired Cases</summary>
                    <div className="mt-2">
                      {course.expired.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No expired cases.</div>
                      ) : (
                        <ul className="list-disc pl-5 space-y-1">
                          {course.expired.map((s, idx) => (
                            <li key={`${course.id}:${s.id}:${s.expired_at ?? "na"}:${idx}`} className="text-sm">
                              <CompletedCaseCard
                                id={s.id}
                                name={s.name}
                                groupMembers={s.teamMembers}
                                date={s.expired_at}
                                feedback={s.feedback ?? "Marked as expired."}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Inactive Courses</h3>
          {filteredInactive.length === 0 ? (
            <div className="text-sm text-muted-foreground">No inactive courses.</div>
          ) : (
            <ul className="space-y-4">
              {filteredInactive.map((course) => (
                <li key={course.id} className="py-2 px-3 rounded border border-transparent hover:border-slate-200">
                  <div className="font-medium mb-2">
                    {course.code ?? ""}{course.code && course.name ? " - " : ""}{course.name ?? "Unnamed Course"}
                  </div>

                  <details className="bg-slate-50 p-2 rounded">
                    <summary className="cursor-pointer font-medium">Completed Cases</summary>
                    <div className="mt-2">
                      {course.completed.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No completed cases.</div>
                      ) : (
                        <ul className="list-disc pl-5 space-y-1">
                          {course.completed.map((s, idx) => (
                            <li key={`${course.id}:${s.id}:${s.completed_at ?? "na"}:${idx}`} className="text-sm">
                              <CompletedCaseCard
                                id={s.id}
                                name={s.name}
                                groupMembers={s.teamMembers}
                                date={s.completed_at}
                                feedback={s.feedback}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>

                  <details className="bg-slate-50 p-2 rounded mt-2">
                    <summary className="cursor-pointer font-medium">Expired Cases</summary>
                    <div className="mt-2">
                      {course.expired.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No expired cases.</div>
                      ) : (
                        <ul className="list-disc pl-5 space-y-1">
                          {course.expired.map((s, idx) => (
                            <li key={`${course.id}:${s.id}:${s.expired_at ?? "na"}:${idx}`} className="text-sm">
                              <CompletedCaseCard
                                id={s.id}
                                name={s.name}
                                groupMembers={s.teamMembers}
                                date={s.expired_at}
                                feedback={s.feedback ?? "Marked as expired."}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
