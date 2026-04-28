// Shared mermaid client. Mermaid is a singleton across the whole SPA, so
// calling mermaid.initialize() from multiple components with different themes
// corrupts dagre layout state on the second render — manifesting as
// "Could not find a suitable point for the given distance" on a diagram
// that parses cleanly.
//
// We initialize ONCE with neutral defaults, then have each call site pass its
// preferred theme through the per-render %%{init}%% directive. The directive
// is scoped to that render and does not mutate global state.

import type { MermaidConfig } from 'mermaid'

let initPromise: Promise<typeof import('mermaid').default> | null = null

export function getMermaid() {
  if (!initPromise) {
    initPromise = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
      })
      return mermaid
    })
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
