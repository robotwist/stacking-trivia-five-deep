import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createHash } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'

const SHELL_EXTRAS = [
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
]

/**
 * Inject the hashed build output into dist/sw.js so the service worker can precache
 * the entire game on first visit and version its caches per build.
 */
function precacheServiceWorker() {
  let outDir = 'dist'
  let bundleFiles = []
  return {
    name: 'deepstack-precache-sw',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    writeBundle(_options, bundle) {
      bundleFiles = Object.keys(bundle).filter((file) => !file.endsWith('.map') && !file.endsWith('.html'))
    },
    async closeBundle() {
      const swPath = path.join(outDir, 'sw.js')
      const urls = [...SHELL_EXTRAS, ...bundleFiles.map((file) => `/${file}`)]
      const buildId = createHash('sha256').update(urls.join('|')).digest('hex').slice(0, 12)
      const source = await readFile(swPath, 'utf8')
      const patched = source
        .replace('__BUILD_ID__', buildId)
        .replace('/* __PRECACHE_URLS__ */ []', JSON.stringify(urls))
      if (patched === source) throw new Error('sw.js placeholders not found; precache would be empty')
      await writeFile(swPath, patched)
    },
  }
}

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const setMeta = (html, attr, name, value) =>
  html.replace(new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`), `$1${escapeAttr(value)}$2`)

/**
 * Link previews need absolute URLs and per-stack tags in static HTML (crawlers don't run JS).
 * Writes dist/s/<key>/index.html for every stack; the SPA then routes /s/<key> to that stack.
 */
function stackSharePages() {
  let outDir = 'dist'
  // Netlify sets DEPLOY_PRIME_URL for previews and URL for production
  const origin = (process.env.DEPLOY_PRIME_URL || process.env.URL || process.env.VITE_SITE_URL || 'https://stacking-trivia-five-deep.netlify.app').replace(/\/$/, '')
  const absolute = (html, url) => html
    .replace(/content="\/og\//g, `content="${origin}/og/`)
    .replace('<meta property="og:url" content="/"', `<meta property="og:url" content="${url}"`)

  return {
    name: 'deepstack-share-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    transformIndexHtml(html) {
      return absolute(html, `${origin}/`)
    },
    async closeBundle() {
      const { PLAYABLE_STACK_REGISTRY } = await import('./tools/playableStacksManifest.js')
      const base = await readFile(path.join(outDir, 'index.html'), 'utf8')
      for (const { key, module } of PLAYABLE_STACK_REGISTRY) {
        const stack = JSON.parse(await readFile(path.resolve('src/data', module.replace(/^\.\//, '')), 'utf8'))
        const title = `${stack.title} — Deeply Trivial`
        const description = `${stack.description} Five questions. One story. Can you go deeper?`
        const image = `${origin}/og/${key}.jpg`
        let html = base
          .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`)
          .replace('<meta property="og:url" content="' + origin + '/"', `<meta property="og:url" content="${origin}/s/${key}"`)
        html = setMeta(html, 'name', 'description', description)
        html = setMeta(html, 'property', 'og:title', title)
        html = setMeta(html, 'property', 'og:description', description)
        html = setMeta(html, 'property', 'og:image', image)
        html = setMeta(html, 'name', 'twitter:title', title)
        html = setMeta(html, 'name', 'twitter:description', description)
        html = setMeta(html, 'name', 'twitter:image', image)
        // Both forms, so /s/<key> (no trailing slash) resolves to the static page on any host
        await mkdir(path.join(outDir, 's', key), { recursive: true })
        await writeFile(path.join(outDir, 's', key, 'index.html'), html)
        await writeFile(path.join(outDir, 's', `${key}.html`), html)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), precacheServiceWorker(), stackSharePages()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  publicDir: 'public',
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: parseInt(process.env.PORT) || 4173,
    host: '0.0.0.0'
  }
})
