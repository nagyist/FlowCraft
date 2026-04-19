import Image from 'next/image'
import type { ToolPage } from '@/lib/tools/types'

export default function ToolExampleGallery({ tool }: { tool: ToolPage }) {
  const examples = tool.example_svgs ?? []
  if (examples.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Example outputs
        </h2>
        <p className="mt-2 text-base text-gray-600">
          Real diagrams our AI has produced from prompts like this one.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {examples.slice(0, 3).map((src, i) => (
          <div
            key={src}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={src}
                alt={`${tool.title} example ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
