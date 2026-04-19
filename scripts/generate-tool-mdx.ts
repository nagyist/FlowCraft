/**
 * Generate MDX landing pages for /tools/[slug] SEO pages.
 *
 * Iterates a curated matrix of (diagram_type × variant) cells and emits one
 * MDX file per new cell under src/content/tools/. Existing files are
 * preserved; already-occupied canonical cells are skipped.
 *
 * Run: pnpm tsx scripts/generate-tool-mdx.ts
 *      pnpm tsx scripts/generate-tool-mdx.ts --dry-run
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { stringify as yamlStringify } from 'yaml'
import { DIAGRAM_META, type DiagramMeta } from '../src/lib/tools/diagram-meta'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'tools')

// Each variant defines how to form the slug + the human-readable tool name
// (used in h1, title, and body text).
interface Variant {
  key: string
  slug: (noun: string) => string
  h1: (displayName: string) => string
  primaryPhrase: (noun: string) => string
}

const VARIANTS: Variant[] = [
  {
    key: 'ai-generator',
    slug: (n) => `ai-${n}-generator`,
    h1: (d) => `AI ${titleCase(d)} Generator`,
    primaryPhrase: (n) => `AI ${n.replace(/-/g, ' ')} generator`,
  },
  {
    key: 'ai-maker',
    slug: (n) => `ai-${n}-maker`,
    h1: (d) => `AI ${titleCase(d)} Maker`,
    primaryPhrase: (n) => `AI ${n.replace(/-/g, ' ')} maker`,
  },
  {
    key: 'free-maker',
    slug: (n) => `free-${n}-maker`,
    h1: (d) => `Free ${titleCase(d)} Maker`,
    primaryPhrase: (n) => `free ${n.replace(/-/g, ' ')} maker`,
  },
  {
    key: 'online-tool',
    slug: (n) => `online-${n}-tool`,
    h1: (d) => `Online ${titleCase(d)} Tool`,
    primaryPhrase: (n) => `online ${n.replace(/-/g, ' ')} tool`,
  },
]

// Legacy slugs that occupy a canonical (diagram_type, variant) cell.
// We skip generating the canonical slug when one of these already exists,
// to avoid publishing near-duplicate pages with the same search intent.
const LEGACY_OCCUPIES: Record<string, string> = {
  'free-flowchart-maker-ai': 'flowchart|free-maker',
  'ai-timeline-maker-ai': 'timeline|ai-maker',
}

function titleCase(s: string): string {
  return s
    .split(' ')
    .map((word) =>
      word.length === 0
        ? word
        : // preserve all-caps tokens like "UML", "ZenUML"
          /^[A-Z]{2,}/.test(word)
          ? word
          : word[0].toUpperCase() + word.slice(1),
    )
    .join(' ')
}

function buildMeta(
  meta: DiagramMeta,
  variant: Variant,
): {
  slug: string
  title: string
  h1: string
  meta_description: string
  diagram_type: string
  example_prompt: string
  example_svgs: string[]
  keywords: string[]
} {
  const slug = variant.slug(meta.noun)
  const h1 = variant.h1(meta.displayName)
  const title = `${h1} — Free Online Tool | FlowCraft`
  const firstWhatSentence = meta.whatIs[0].split('. ')[0] + '.'
  const meta_description = clip(
    `${capitalise(variant.primaryPhrase(meta.noun))}. ${firstWhatSentence} Export as SVG, PNG, or Mermaid source.`,
    160,
  )
  const keywords = dedupeKeywords([
    variant.primaryPhrase(meta.noun),
    ...meta.keywordSeeds,
    `${meta.noun.replace(/-/g, ' ')} online`,
    `${meta.noun.replace(/-/g, ' ')} from text`,
  ])
  const example_svgs = [1, 2, 3].map((i) => `/tools/${slug}/example-${i}.svg`)
  return {
    slug,
    title,
    h1,
    meta_description,
    diagram_type: meta.diagramType,
    example_prompt: meta.examplePrompt,
    example_svgs,
    keywords,
  }
}

function clip(s: string, max: number): string {
  if (s.length <= max) return s
  const trimmed = s.slice(0, max)
  const lastSpace = trimmed.lastIndexOf(' ')
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed).trimEnd() + '…'
}

function capitalise(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)
}

function dedupeKeywords(kws: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const kw of kws) {
    const key = kw.toLowerCase().trim()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(kw)
  }
  return out
}

function pickRelated(
  currentSlug: string,
  currentDiagramType: string,
  allSlugsByType: Map<string, string[]>,
  allSlugs: string[],
): string[] {
  const siblings = (allSlugsByType.get(currentDiagramType) ?? []).filter(
    (s) => s !== currentSlug,
  )
  const picked: string[] = siblings.slice(0, 4)
  if (picked.length >= 4) return picked
  for (const s of allSlugs) {
    if (picked.length >= 4) break
    if (s === currentSlug || picked.includes(s)) continue
    picked.push(s)
  }
  return picked
}

function renderBody(
  meta: DiagramMeta,
  variant: Variant,
  h1: string,
): string {
  const displayName = meta.displayName
  const displayPlural = meta.displayNamePlural
  const introSentence = `${h1} turns a plain-English description into a ${displayName} you can export, share, or drop straight into your docs. No drawing tools, no syntax cheat-sheets — just describe what you need and get a clean Mermaid-compatible diagram back.`

  const whatIs = meta.whatIs.join('\n\n')
  const whoUsesList = meta.whoUses.map((p) => `- ${p}`).join('\n')
  const whyAi = meta.whyAi.join('\n\n')
  const howStepsList = meta.howSteps
    .map((step, i) => `${i + 1}. ${step.replace(/{toolName}/g, h1)}`)
    .join('\n')
  const faqsMd = meta.faqs
    .map((f) => `### ${f.q}\n\n${f.a}`)
    .join('\n\n')

  return `${introSentence}

## What is a ${displayName}?

${whatIs}

## Who uses ${displayPlural}?

${whoUsesList}

## Why generate ${displayPlural} with AI?

${whyAi}

## How to use the ${h1}

${howStepsList}

## FAQ

${faqsMd}
`
}

function renderFrontmatter(fm: Record<string, unknown>, related: string[]): string {
  // yaml.stringify auto-quotes strings containing `:`, `#`, leading `-`, etc.
  // which is exactly the YAML safety we need (the example_prompt colon gotcha).
  const payload = {
    slug: fm.slug,
    title: fm.title,
    h1: fm.h1,
    meta_description: fm.meta_description,
    diagram_type: fm.diagram_type,
    example_prompt: fm.example_prompt,
    example_svgs: fm.example_svgs,
    keywords: fm.keywords,
    related,
  }
  return `---\n${yamlStringify(payload, { lineWidth: 0 })}---\n`
}

// ──────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────

function main() {
  const dryRun = process.argv.includes('--dry-run')

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`content dir missing: ${CONTENT_DIR}`)
    process.exit(1)
  }

  // 1) Find existing slugs on disk.
  const existingFiles = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
  const existingSlugs = new Set(existingFiles.map((f) => f.replace(/\.mdx$/, '')))

  // 2) Compute the target set: every (diagram_type, variant) cell.
  type Cell = { meta: DiagramMeta; variant: Variant; slug: string }
  const cells: Cell[] = []
  for (const meta of DIAGRAM_META) {
    for (const variant of VARIANTS) {
      cells.push({ meta, variant, slug: variant.slug(meta.noun) })
    }
  }

  // 3) Mark cells occupied by legacy slugs so we don't publish near-dupes.
  const occupiedByLegacy = new Set<string>()
  for (const [legacySlug, canonicalKey] of Object.entries(LEGACY_OCCUPIES)) {
    if (existingSlugs.has(legacySlug)) occupiedByLegacy.add(canonicalKey)
  }

  // 4) Build the map of slugs-by-diagram_type (for `related` picking).
  //    Include both existing-on-disk and soon-to-be-emitted slugs so
  //    related links resolve post-generation.
  const allEmittedOrExistingSlugs: string[] = [...existingSlugs]
  const newCells: Cell[] = []
  for (const cell of cells) {
    const canonicalKey = `${cell.meta.diagramType}|${cell.variant.key}`
    if (existingSlugs.has(cell.slug)) continue
    if (occupiedByLegacy.has(canonicalKey)) continue
    newCells.push(cell)
    allEmittedOrExistingSlugs.push(cell.slug)
  }

  // Map diagram_type → [slugs] for related selection. Read existing frontmatter
  // just enough to classify legacy slugs by their diagram_type.
  const slugsByType = new Map<string, string[]>()
  for (const slug of existingSlugs) {
    const file = path.join(CONTENT_DIR, `${slug}.mdx`)
    const raw = fs.readFileSync(file, 'utf8')
    const typeMatch = raw.match(/^diagram_type:\s*(\S+)/m)
    const t = typeMatch ? typeMatch[1].trim() : 'unknown'
    pushMap(slugsByType, t, slug)
  }
  for (const cell of newCells) pushMap(slugsByType, cell.meta.diagramType, cell.slug)

  // 5) Generate.
  let written = 0
  const plan: string[] = []
  for (const cell of newCells) {
    const fm = buildMeta(cell.meta, cell.variant)
    const related = pickRelated(
      fm.slug,
      cell.meta.diagramType,
      slugsByType,
      allEmittedOrExistingSlugs,
    )
    const body = renderBody(cell.meta, cell.variant, fm.h1)
    const frontmatter = renderFrontmatter(fm, related)
    const contents = `${frontmatter}\n${body}`

    const target = path.join(CONTENT_DIR, `${fm.slug}.mdx`)
    if (dryRun) {
      plan.push(fm.slug)
      continue
    }
    fs.writeFileSync(target, contents, 'utf8')
    written += 1
  }

  if (dryRun) {
    console.log(`[dry-run] would write ${plan.length} files:`)
    for (const s of plan.sort()) console.log(`  ${s}`)
  } else {
    console.log(`wrote ${written} new MDX files to ${path.relative(ROOT, CONTENT_DIR)}`)
    const skipped = cells.length - newCells.length
    console.log(`skipped ${skipped} cells (existing or legacy-occupied)`)
    console.log(`total tools on disk now: ${existingSlugs.size + written}`)
  }
}

function pushMap<K, V>(m: Map<K, V[]>, k: K, v: V): void {
  const arr = m.get(k)
  if (arr) arr.push(v)
  else m.set(k, [v])
}

main()
