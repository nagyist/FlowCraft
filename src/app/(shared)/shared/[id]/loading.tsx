import DiagramSkeleton from '@/components/skeletons/DiagramSkeleton'
import {
  SkeletonHeader,
  SkeletonLine,
} from '@/components/skeletons/SkeletonBlock'

export default function SharedDiagramLoading() {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <SkeletonHeader label="Shared · Diagram" />
        <div className="mb-6 space-y-3">
          <SkeletonLine className="h-7 w-64 max-w-full" />
          <SkeletonLine className="h-4 w-40" />
        </div>
        <DiagramSkeleton />
      </div>
    </div>
  )
}
