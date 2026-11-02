import { Skeleton } from "@/components/ui/skeleton";

export default function CourseListSkeleton() {
  return (
    <div className="w-full">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border rounded-md my-4 p-4 py-4 border-l-10 border-l-gray-300">
          <Skeleton className="h-7 w-32 mb-2" />
          <Skeleton className="h-5 w-64 mb-1" />
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      ))}
    </div>
  );
}