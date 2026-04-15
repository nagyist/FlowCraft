export default function BlogsLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading blog posts"
      className="mx-auto max-w-5xl px-6 py-12 lg:px-8"
    >
      <div className="mb-10 h-10 w-64 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
