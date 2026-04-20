'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables, type ChartConfiguration } from 'chart.js'

Chart.register(...registerables)

export default function ChartJsViewer({ config }: { config: ChartConfiguration }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const c = new Chart(ref.current, config)
    return () => c.destroy()
  }, [config])
  return (
    <div className="h-[480px] rounded-xl bg-white p-4">
      <canvas ref={ref} />
    </div>
  )
}
