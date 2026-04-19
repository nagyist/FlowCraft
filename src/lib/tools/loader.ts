import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { ToolPage, ToolPageFrontmatter } from './types'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'tools')

let cache: ToolPage[] | null = null

function readAll(): ToolPage[] {
  if (cache) return cache
  if (!fs.existsSync(CONTENT_DIR)) {
    cache = []
    return cache
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))

  const tools: ToolPage[] = files.map((filename) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf8')
    const { data, content } = matter(raw)
    const fm = data as ToolPageFrontmatter
    const fallbackSlug = filename.replace(/\.mdx?$/, '')
    return {
      slug: fm.slug ?? fallbackSlug,
      title: fm.title,
      h1: fm.h1,
      meta_description: fm.meta_description,
      diagram_type: fm.diagram_type,
      example_prompt: fm.example_prompt,
      example_svgs: fm.example_svgs,
      keywords: fm.keywords,
      related: fm.related,
      body: content.trim(),
    }
  })

  cache = tools.sort((a, b) => a.slug.localeCompare(b.slug))
  return cache
}

export function getAllTools(): ToolPage[] {
  return readAll()
}

export function getAllToolSlugs(): string[] {
  return readAll().map((t) => t.slug)
}

export function getToolBySlug(slug: string): ToolPage | null {
  return readAll().find((t) => t.slug === slug) ?? null
}

export function getRelatedTools(slug: string, limit = 4): ToolPage[] {
  const all = readAll()
  const current = all.find((t) => t.slug === slug)
  if (!current) return []

  const bySlug = new Map(all.map((t) => [t.slug, t]))
  const picked: ToolPage[] = []
  const seen = new Set<string>([slug])

  for (const rel of current.related ?? []) {
    const match = bySlug.get(rel)
    if (match && !seen.has(match.slug)) {
      picked.push(match)
      seen.add(match.slug)
      if (picked.length >= limit) return picked
    }
  }

  for (const t of all) {
    if (seen.has(t.slug)) continue
    if (t.diagram_type === current.diagram_type) {
      picked.push(t)
      seen.add(t.slug)
      if (picked.length >= limit) return picked
    }
  }

  for (const t of all) {
    if (seen.has(t.slug)) continue
    picked.push(t)
    seen.add(t.slug)
    if (picked.length >= limit) return picked
  }

  return picked
}
