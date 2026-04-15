export default function DiagramSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading diagram"
      className="flex h-full min-h-[400px] w-full items-center justify-center rounded-lg bg-gray-50"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        <div className="text-sm text-gray-500">Loading diagram…</div>
      </div>
    </div>
  )
}
