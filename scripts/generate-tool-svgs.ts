/**
 * Render the 3 example SVGs for every /tools/<slug> landing page.
 *
 * Reads all MDX files under src/content/tools/, looks up the diagram_type's
 * Mermaid snippets in DIAGRAM_EXAMPLES, and writes SVGs to
 * public/tools/<slug>/example-{1,2,3}.svg via the mmdc CLI.
 *
 * Idempotent: existing SVGs are skipped unless --force is passed.
 *
 * Run: pnpm tsx scripts/generate-tool-svgs.ts
 *      pnpm tsx scripts/generate-tool-svgs.ts --force
 *      pnpm tsx scripts/generate-tool-svgs.ts --only <slug>
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { DIAGRAM_EXAMPLES } from '../src/lib/tools/diagram-examples'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'tools')
const PUBLIC_TOOLS_DIR = path.join(ROOT, 'public', 'tools')
const PUPPETEER_CONFIG = path.join(__dirname, 'mermaid-puppeteer.json')
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'flowcraft-mmdc-'))

function main() {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const onlyIdx = args.indexOf('--only')
  const onlySlug = onlyIdx >= 0 ? args[onlyIdx + 1] : null

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`content dir missing: ${CONTENT_DIR}`)
    process.exit(1)
  }

  const mdxFiles = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .sort()

  type Entry = { slug: string; diagramType: string }
  const entries: Entry[] = []
  for (const file of mdxFiles) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8')
    const { data } = matter(raw)
    const slug = (data.slug as string) ?? file.replace(/\.mdx$/, '')
    const diagramType = data.diagram_type as string
    if (!diagramType) {
      console.warn(`skipping ${file}: no diagram_type`)
      continue
    }
    if (onlySlug && slug !== onlySlug) continue
    entries.push({ slug, diagramType })
  }

  console.log(`found ${entries.length} tool entries to process`)

  let created = 0
  let skipped = 0
  const failures: { slug: string; index: number; error: string }[] = []

  for (const entry of entries) {
    const snippets = DIAGRAM_EXAMPLES[entry.diagramType]
    if (!snippets) {
      console.warn(`no examples mapped for diagram_type=${entry.diagramType} (slug=${entry.slug})`)
      continue
    }

    const outDir = path.join(PUBLIC_TOOLS_DIR, entry.slug)
    fs.mkdirSync(outDir, { recursive: true })

    for (let i = 0; i < 3; i++) {
      const outFile = path.join(outDir, `example-${i + 1}.svg`)
      if (!force && fs.existsSync(outFile)) {
        skipped += 1
        continue
      }

      const mmdFile = path.join(TMP_DIR, `${entry.slug}-${i + 1}.mmd`)
      fs.writeFileSync(mmdFile, snippets[i], 'utf8')

      try {
        execFileSync(
          'pnpm',
          [
            'exec',
            'mmdc',
            '-i', mmdFile,
            '-o', outFile,
            '-b', 'transparent',
            '-t', 'neutral',
            '-p', PUPPETEER_CONFIG,
          ],
          { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
        )
        created += 1
        process.stdout.write('.')
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        failures.push({ slug: entry.slug, index: i + 1, error: msg.split('\n').slice(0, 3).join(' | ') })
        process.stdout.write('x')
      }
    }
  }

  process.stdout.write('\n')
  console.log(`created: ${created}`)
  console.log(`skipped (already existed): ${skipped}`)
  console.log(`failures: ${failures.length}`)
  if (failures.length > 0) {
    for (const f of failures) {
      console.error(`  ${f.slug} example-${f.index}: ${f.error}`)
    }
  }

  // Cleanup temp dir.
  try { fs.rmSync(TMP_DIR, { recursive: true, force: true }) } catch {}

  if (failures.length > 0) process.exit(1)
}

main()
