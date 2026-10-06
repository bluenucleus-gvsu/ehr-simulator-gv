import { notFound, redirect } from "next/navigation";
import ProfileHeader from "@/app/user/components/ProfileHeader";
import CompletedCaseCard from "@/app/user/components/CompletedCaseCard";
import AssignedCaseCard from "@/app/user/components/AssignedCaseCard";
import { createServerSupabase } from "@/utils/supabase/server";
import { getUserCourses } from "@/actions/getUserCourses";

export default async function ProfilePage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const isOwnProfile = user.id === id;

  const studentName = isOwnProfile
    ? user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Student"
    : await (async () => {
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, email, role")
        .eq("id", id)
        .single();

      if (profile?.role && profile.role !== "student") {
        redirect("/admin");
      }
      return profile?.full_name || profile?.email || "Student";
    })();

  const avatarUrl = isOwnProfile ? user.user_metadata?.avatar_url || "" : "";

  const { activeCourses, inactiveCourses } = await getUserCourses(id);
  const allCourses = [...activeCourses, ...inactiveCourses];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <ProfileHeader
        name={studentName}
        avatarUrl={avatarUrl}
        classes={allCourses.map((c) => c.code || c.name || "").filter(Boolean)}
      />

      <section>
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-xl font-semibold mb-3">Active Courses</h3>
          {activeCourses.length === 0 ? (
            <div className="text-sm text-muted-foreground">No active courses.</div>
          ) : (
            <div className="space-y-4">
              {activeCourses.map((course) => (
                <div key={course.id} className="py-2 px-3 rounded border border-slate-300">
                  <div className="font-medium mb-2">
                    {course.code ?? ""}{course.code && course.name ? " - " : ""}{course.name ?? "Unnamed Course"}
                  </div>

                  <details className="mb-4 bg-slate-100 p-3 rounded">
                    <summary className="cursor-pointer font-medium">Active Sessions</summary>
                    <div className="mt-2">
                      {course.activeSessions.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No active sessions.</div>
                      ) : (
                        <div className="ml-2 space-y-2">
                          {course.activeSessions.map((session) => (
                            <div key={session.sessionId} className="text-sm">
                              <AssignedCaseCard
                                id={session.sessionId}
                                caseId={session.caseId}
                                sessionId={session.sessionId}
                                availability={session.availability}
                                name={session.caseName}
                                simTime={session.simTime}
                                presimTime={session.presimTime}
                                groupMembers={session.teamMembers}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>

                  <details className="bg-slate-100 p-3 rounded">
                    <summary className="cursor-pointer font-medium">Past Sessions</summary>
                    <div className="mt-2">
                      {course.pastSessions.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No past sessions.</div>
                      ) : (
                        <div className="pl-5 space-y-1">
                          {course.pastSessions.map((session) => (
                            <div key={session.sessionId} className="text-sm">
                              <CompletedCaseCard
                                id={session.sessionId}
                                caseId={session.caseId}
                                sessionId={session.sessionId}
                                name={session.caseName}
                                groupMembers={session.teamMembers}
                                feedback={session.feedback}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Inactive Courses</h3>
          {inactiveCourses.length === 0 ? (
            <div className="text-sm text-muted-foreground">No inactive courses.</div>
          ) : (
            <ul className="space-y-4">
              {inactiveCourses.map((course) => (
                <li key={course.id} className="py-2 px-3 rounded border border-slate-200">
                  <div className="font-medium mb-2">
                    {course.code ?? ""}{course.code && course.name ? " - " : ""}{course.name ?? "Unnamed Course"}
                  </div>

                  <details className="bg-slate-50 p-2 rounded">
                    <summary className="cursor-pointer font-medium">Past Sessions</summary>
                    <div className="mt-2">
                      {course.pastSessions.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No past sessions.</div>
                      ) : (
                        <div className="list-disc pl-5 space-y-1">
                          {course.pastSessions.map((session) => (
                            <div key={session.sessionId} className="text-sm">
                              <CompletedCaseCard
                                id={session.sessionId}
                                caseId={session.caseId}
                                sessionId={session.sessionId}
                                name={session.caseName}
                                groupMembers={session.teamMembers}
                                feedback={session.feedback}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
