// Shared mermaid client. Two reasons it has to live behind one module:
//
// 1. mermaid is a singleton across the SPA. Calling mermaid.initialize() twice
//    with different themes corrupts dagre layout state on the second render.
//    We initialize ONCE with neutral defaults; each call site passes theme via
//    the per-render %%{init}%% directive (scoped to that render only).
//
// 2. mermaid measures text via getComputedTextLength() against an SVG temp div
//    appended to document.body. If the page's custom fonts (Satoshi / Instrument
//    Serif / JetBrains Mono) haven't loaded yet, measurements come back wrong,
//    nodes get bogus dimensions, and dagre's calculatePoint throws
//    "Could not find a suitable point for the given distance" on otherwise-valid
//    diagrams. Awaiting document.fonts.ready before the first parse/render
//    eliminates the race.

import type { MermaidConfig } from 'mermaid'

async function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined') return
  const ready = document.fonts?.ready
  if (!ready) return
  try {
    await ready
  } catch {
    /* fonts.ready rejecting shouldn't block render */
  }
}

let initPromise: Promise<typeof import('mermaid').default> | null = null

export function getMermaid() {
  if (!initPromise) {
    initPromise = (async () => {
      const { default: mermaid } = await import('mermaid')
      await waitForFonts()
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
      })
      return mermaid
    })()
  }
  return initPromise
}

function escapeForDirective(value: unknown): string {
  return JSON.stringify(value)
}

function buildInitDirective(config: MermaidConfig): string {
  return `%%{init: ${escapeForDirective(config)}}%%\n`
}

const INIT_DIRECTIVE_RE = /^\s*%%\{[^}]*\}%%\s*\n?/

function stripExistingInitDirective(code: string): string {
  return code.replace(INIT_DIRECTIVE_RE, '')
}

export async function renderMermaid(
  id: string,
  code: string,
  config?: MermaidConfig,
): Promise<{ svg: string }> {
  const mermaid = await getMermaid()
  await waitForFonts()
  const source = config
    ? buildInitDirective(config) + stripExistingInitDirective(code)
    : code
  return mermaid.render(id, source)
}

export async function parseMermaid(code: string): Promise<boolean> {
  const mermaid = await getMermaid()
  return mermaid
    .parse(code, { suppressErrors: true })
    .then((res) => res !== false)
    .catch(() => false)
}
