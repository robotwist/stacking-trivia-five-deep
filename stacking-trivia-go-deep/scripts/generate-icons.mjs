#!/usr/bin/env node
/**
 * Rasterize the app icon into every size the manifest, index.html, and iOS need.
 * Run with: npm run icons
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { mkdir, writeFile } from 'fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.join(__dirname, '..', 'public', 'icons')

// Five levels narrowing toward one answer. Everything sits inside the maskable safe zone
// (a circle of radius 0.4 × size), so the same art works for "any" and "maskable".
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1f2937"/>
      <stop offset="1" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fde68a"/>
      <stop offset="1" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <rect x="136" y="146" width="240" height="32" rx="16" fill="url(#gold)" opacity="0.4"/>
  <rect x="158" y="196" width="196" height="32" rx="16" fill="url(#gold)" opacity="0.58"/>
  <rect x="180" y="246" width="152" height="32" rx="16" fill="url(#gold)" opacity="0.76"/>
  <rect x="202" y="296" width="108" height="32" rx="16" fill="url(#gold)" opacity="0.92"/>
  <circle cx="256" cy="366" r="22" fill="#fbbf24"/>
</svg>`

const outputs = [
  ...[72, 96, 128, 144, 152, 192, 384, 512].map((s) => [`icon-${s}x${s}.png`, s]),
  ['icon-192x192-maskable.png', 192],
  ['icon-512x512-maskable.png', 512],
  ...[57, 72, 76, 114, 120, 144, 152, 180].map((s) => [`apple-touch-icon-${s}x${s}.png`, s]),
  ['apple-touch-icon.png', 180],
  ...[16, 32, 48, 64].map((s) => [`favicon-${s}x${s}.png`, s]),
  ['favicon.png', 64],
]

await mkdir(iconsDir, { recursive: true })
const source = Buffer.from(iconSvg)
for (const [name, size] of outputs) {
  await sharp(source, { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(iconsDir, name))
}
await writeFile(path.join(iconsDir, 'icon.svg'), iconSvg.trim() + '\n')
console.log(`Wrote ${outputs.length} icons to ${path.relative(process.cwd(), iconsDir)}`)
