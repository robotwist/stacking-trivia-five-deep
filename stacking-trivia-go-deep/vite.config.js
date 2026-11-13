import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createHash } from 'crypto'
import { readFile, writeFile } from 'fs/promises'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), precacheServiceWorker()],
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
