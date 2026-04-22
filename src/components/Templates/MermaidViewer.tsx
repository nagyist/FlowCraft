'use client'

// Minimal read-only Mermaid renderer for template pages. The shared
// MermaidChartViewer in this repo expects an already-rendered SVG, but
// templates store raw Mermaid source, so we render it client-side.
import { useEffect, useRef, useState } from 'react'

let mermaidInited = false

export default function MermaidViewer({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [svg, setSvg] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    const id = `tpl-${Math.random().toString(36).slice(2, 10)}`
    ;(async () => {
      try {
        const { default: mermaid } = await import('mermaid')
        if (!mermaidInited) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
          })
          mermaidInited = true
        }
        const ok = await mermaid
          .parse(code, { suppressErrors: true })
          .catch(() => false)
        if (!ok) throw new Error('Invalid mermaid syntax')
        const { svg } = await mermaid.render(id, code)
        if (!cancelled) {
          setSvg(svg)
          setError(null)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to render diagram')
      } finally {
        document.getElementById('d' + id)?.remove()
      }
    })()
    return () => {
      cancelled = true
      document.getElementById('d' + id)?.remove()
    }
  }, [code])

  if (error) {
    return (
      <div className="flex h-[480px] items-center justify-center p-6 text-center text-sm text-rose-600">
        {error}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex h-[480px] w-full items-center justify-center overflow-auto bg-white p-4 [&_svg]:max-h-full [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
