import { Skeleton } from "@/components/ui/skeleton";

export default function DapurLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
