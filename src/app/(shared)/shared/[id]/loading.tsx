import DiagramSkeleton from '@/components/skeletons/DiagramSkeleton'

export default function SharedDiagramLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
      <div className="mb-6 h-7 w-56 animate-pulse rounded bg-gray-200" />
      <DiagramSkeleton />
    </div>
  )
}
