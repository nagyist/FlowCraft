import DiagramSkeleton from '@/components/skeletons/DiagramSkeleton'

export default function DiagramLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-gray-200" />
      <DiagramSkeleton />
    </div>
  )
}
