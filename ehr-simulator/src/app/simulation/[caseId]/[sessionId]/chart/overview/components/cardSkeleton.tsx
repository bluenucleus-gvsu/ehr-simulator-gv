import { Skeleton } from "@/components/ui/skeleton"

const CardSkeleton = () => {
  return (
    <div className="h-full w-full grid gap-1 place-items-center">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/8" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-3/4" />

    </div>
  )
}

export default CardSkeleton