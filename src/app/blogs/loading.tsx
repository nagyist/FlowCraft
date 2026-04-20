import {
  SkeletonBlock,
  SkeletonHeader,
  SkeletonLine,
} from '@/components/skeletons/SkeletonBlock'

export default function BlogsLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading blog posts"
      className="min-h-screen bg-ink text-paper"
    >
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <SkeletonHeader label="Journal · Entries" />
        <div className="mb-10 space-y-3">
          <SkeletonLine className="h-10 w-80 max-w-full" />
          <SkeletonLine className="h-4 w-64 max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <SkeletonBlock className="h-48" />
              <SkeletonLine className="h-5 w-3/4" />
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
