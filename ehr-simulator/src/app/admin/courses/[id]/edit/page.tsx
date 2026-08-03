import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCourseEditBundle } from "@/actions/courses";
import EditCourseClient from "./EditCourseClient";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const result = await getCourseEditBundle(id);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 space-y-4">
        <p>Error loading course: {result.message}</p>
        <Button asChild variant="outline">
          <Link href={`/admin/courses/${id}`}>Back</Link>
        </Button>
      </div>
    );
  }

  return <EditCourseClient bundle={result.data} />;
}
