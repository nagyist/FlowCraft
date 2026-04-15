#!/usr/bin/env node
/**
 * Compresses heavy PNGs in src/images/ to WebP + AVIF variants in public/images/.
 * Run once manually:  node scripts/compress-images.mjs
 *
 * Depends on `sharp` (already in devDependencies).
 */

import sharp from 'sharp'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'src', 'images')
const OUT_DIR = path.join(ROOT, 'public', 'images')

const TARGETS = [
  'FlowCraft_ForTeachers_Pic.png',
  'FlowCraft_ForEngineers_Pic.png',
  'FlowCraft_ForHealthcare_Pic.png',
  'FlowCraft_ForStudents_Pic.png',
]

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function compress(filename) {
  const input = path.join(SRC_DIR, filename)
  const base = filename.replace(/\.(png|jpg|jpeg)$/i, '')

  try {
    await fs.access(input)
  } catch {
    console.warn(`Skipping ${filename}: not found at ${input}`)
    return
  }

  const webpOut = path.join(OUT_DIR, `${base}.webp`)
  const avifOut = path.join(OUT_DIR, `${base}.avif`)

  await sharp(input)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(webpOut)

  await sharp(input)
    .resize({ width: 1600, withoutEnlargement: true })
    .avif({ quality: 55 })
    .toFile(avifOut)

  const [origStat, webpStat, avifStat] = await Promise.all([
    fs.stat(input),
    fs.stat(webpOut),
    fs.stat(avifOut),
  ])

  const kb = (b) => (b / 1024).toFixed(0) + 'KB'
  console.log(
    `${filename}: ${kb(origStat.size)} -> webp ${kb(webpStat.size)}, avif ${kb(avifStat.size)}`,
  )
}

async function main() {
  await ensureDir(OUT_DIR)
  for (const t of TARGETS) {
    await compress(t)
  }
  console.log(`\nDone. Outputs in ${OUT_DIR}`)
  console.log('Update imports to use /images/<name>.webp via next/image.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
