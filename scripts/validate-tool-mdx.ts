import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.resolve(__dirname, '..', 'src', 'content', 'tools')

const files = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith('.mdx'))
  .sort()

let ok = 0
const errors: string[] = []
const slugsSeen = new Set<string>()
const byType = new Map<string, number>()

for (const f of files) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8')
  try {
    const { data, content } = matter(raw)
    const required = ['slug', 'title', 'meta_description', 'diagram_type', 'example_prompt']
    for (const r of required) {
      if (!(r in data)) {
        errors.push(`${f}: missing required field "${r}"`)
        continue
      }
    }
    const slug = data.slug as string
    if (slugsSeen.has(slug)) errors.push(`${f}: duplicate slug "${slug}"`)
    slugsSeen.add(slug)
    const dt = data.diagram_type as string
    byType.set(dt, (byType.get(dt) ?? 0) + 1)
    if (content.trim().length < 300) {
      errors.push(`${f}: body is suspiciously short (${content.trim().length} chars)`)
    }
    ok += 1
  } catch (e) {
    errors.push(`${f}: parse error — ${e instanceof Error ? e.message : String(e)}`)
  }
}

console.log(`parsed OK: ${ok}/${files.length}`)
console.log('by diagram_type:')
for (const [k, v] of [...byType.entries()].sort()) console.log(`  ${k}: ${v}`)

if (errors.length > 0) {
  console.log('\nerrors:')
  for (const e of errors) console.log(`  ${e}`)
  process.exit(1)
}
