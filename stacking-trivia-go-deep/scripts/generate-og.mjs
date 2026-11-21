#!/usr/bin/env node
/* global Buffer, console */
/**
 * Render a 1200×630 link-preview image for every playable stack, plus a default.
 * Shown by iMessage, WhatsApp, Slack, X, and Facebook when someone shares a challenge.
 * Run with: npm run og (commit the output in public/og/)
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { mkdir, readFile } from 'fs/promises'
import { PLAYABLE_STACK_REGISTRY } from '../tools/playableStacksManifest.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.join(__dirname, '..')
const outDir = path.join(appDir, 'public', 'og')

const escapeXml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]))

/** Greedy word wrap by character budget; good enough for a fixed-width layout. */
const wrap = (text, maxChars, maxLines) => {
  const lines = []
  let line = ''
  for (const word of String(text).split(/\s+/)) {
    if ((line + ' ' + word).trim().length > maxChars && line) {
      lines.push(line)
      line = word
      if (lines.length === maxLines) break
    } else {
      line = (line + ' ' + word).trim()
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  if (lines.length === maxLines && String(text).length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[,.;:—-]?\s*\S*$/, '') + '…'
  }
  return lines
}

const ladder = `
  <g transform="translate(905 175)">
    <rect x="0" y="0" width="230" height="34" rx="17" fill="url(#gold)" opacity="0.4"/>
    <rect x="22" y="56" width="186" height="34" rx="17" fill="url(#gold)" opacity="0.58"/>
    <rect x="44" y="112" width="142" height="34" rx="17" fill="url(#gold)" opacity="0.76"/>
    <rect x="66" y="168" width="98" height="34" rx="17" fill="url(#gold)" opacity="0.92"/>
    <circle cx="115" cy="250" r="24" fill="#fbbf24"/>
  </g>`

// Text must stay left of the ladder (x ≈ 880). Bold serif capitals run about 0.6em wide.
const card = ({ eyebrow, title, description }) => {
  let titleSize = 64
  let titleLines = wrap(title, 21, 3)
  if (titleLines.length > 2) {
    titleSize = 54
    titleLines = wrap(title, 24, 3)
  }
  const descLines = wrap(description, 52, 2)
  const titleTop = 200
  const descTop = titleTop + titleLines.length * (titleSize + 10) + 24
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1f2937"/><stop offset="0.6" stop-color="#111827"/><stop offset="1" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="8" fill="url(#gold)"/>
  <text x="72" y="120" font-family="Liberation Sans, DejaVu Sans, sans-serif" font-size="26" letter-spacing="6" fill="#fbbf24">${escapeXml(eyebrow.toUpperCase())}</text>
  ${titleLines.map((l, i) => `<text x="72" y="${titleTop + i * (titleSize + 10)}" font-family="Noto Serif, DejaVu Serif, serif" font-weight="700" font-size="${titleSize}" fill="#fef3c7">${escapeXml(l)}</text>`).join('\n  ')}
  ${descLines.map((l, i) => `<text x="72" y="${descTop + i * 42}" font-family="Noto Serif, DejaVu Serif, serif" font-size="32" fill="#d1d5db">${escapeXml(l)}</text>`).join('\n  ')}
  <text x="72" y="560" font-family="Noto Serif, DejaVu Serif, serif" font-style="italic" font-size="34" fill="#fbbf24">Five questions. One story. Can you go deeper?</text>
  ${ladder}
</svg>`
}

const categories = JSON.parse(await readFile(path.join(appDir, 'src/data/categories.json'), 'utf8')).categories
const categoryOf = {}
for (const category of Object.values(categories)) {
  // Short label: drop emoji and anything after a colon ("Character Name Origins: Where…")
  const label = category.title.replace(/^[^\p{L}]+/u, '').split(':')[0].trim().slice(0, 26)
  for (const key of category.stacks) categoryOf[key] ??= label
}

await mkdir(outDir, { recursive: true })

const render = (svg, file) => sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(outDir, file))

await render(card({
  eyebrow: 'Deeply Trivial',
  title: 'Trivia where every answer unlocks the next question',
  description: 'Forty-five true stories, points that double every level, and one miss ends the dive.',
}), 'default.jpg')

for (const { key, module } of PLAYABLE_STACK_REGISTRY) {
  const stack = JSON.parse(await readFile(path.join(appDir, 'src/data', module.replace(/^\.\//, '')), 'utf8'))
  await render(card({
    eyebrow: `Deeply Trivial · ${categoryOf[key] || 'Trivia'}`,
    title: stack.title,
    description: stack.description || '',
  }), `${key}.jpg`)
}

console.log(`Wrote ${PLAYABLE_STACK_REGISTRY.length + 1} preview images to public/og/`)
