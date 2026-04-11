import { useState, useRef, useCallback } from 'react'
import { InputClassification, OptionType } from '@/lib/utils'

export function useClassifyInput() {
  const [isClassifying, setIsClassifying] = useState(false)
  const [result, setResult] = useState<InputClassification | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const classify = useCallback(
    (text: string, filename?: string) => {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Cancel in-flight request
      if (abortRef.current) {
        abortRef.current.abort()
      }

      // Don't classify if too short
      if (text.trim().length < 30) {
        setResult(null)
        setError(null)
        return
      }

      // Debounce 800ms
      debounceRef.current = setTimeout(async () => {
        const controller = new AbortController()
        abortRef.current = controller

        setIsClassifying(true)
        setError(null)

        try {
          const res = await fetch('/api/classify-input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: text.slice(0, 4000),
              filename: filename || null,
            }),
            signal: controller.signal,
          })

          if (!res.ok) {
            throw new Error('Classification failed')
          }

          const data = await res.json()

          if (!controller.signal.aborted) {
            setResult({
              inputType: data.input_type,
              suggestedDiagram: data.suggested_diagram as OptionType,
              confidence: data.confidence,
              reasoning: data.reasoning,
            })
          }
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            setError(e.message || 'Classification failed')
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsClassifying(false)
          }
        }
      }, 800)
    },
    [],
  )

  const reset = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()
    setResult(null)
    setError(null)
    setIsClassifying(false)
  }, [])

  return { classify, isClassifying, result, error, reset }
}
