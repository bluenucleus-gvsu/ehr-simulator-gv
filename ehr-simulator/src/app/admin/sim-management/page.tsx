import CoursesView from "@/app/admin/sim-management/components/sectionSelection";
import { getActiveCourses } from "@/actions/sim-management";

export default async function SimManagement() {
  const courses = await getActiveCourses()

  return (
    <div className="w-full">
      <header className="bg-white border-b px-8 py-4 pb-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold tracking-tight">SIM MANAGEMENT</h1>

            <p className="text-xs text-gray-500">Select a course section to manage live simulations</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl">
        <CoursesView courses={courses} />
      </div>
    </div>
  );
}
