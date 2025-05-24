export default function Loading() {
  return (
    <div className="container mx-auto animate-pulse px-4 py-8">
      {/* Search Header Skeleton */}
      <div className="mb-8">
        <div className="mb-4 h-10 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Search Results Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-8 flex justify-center">
        <div className="flex gap-2">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            ))}
        </div>
      </div>
    </div>
  )
}
