#!/usr/bin/env node
/**
 * Normalize playable stack JSON files to gold-standard schema.
 * Usage: node tools/migrateStacks.js [--write]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { normalizeStack } from '../src/utils/normalizeStack.js'
import { PLAYABLE_STACK_PATHS } from './playableStacksManifest.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const write = process.argv.includes('--write')

for (const relPath of PLAYABLE_STACK_PATHS) {
  const absPath = path.join(root, relPath)
  if (!fs.existsSync(absPath)) {
    console.log(`SKIP (missing): ${relPath}`)
    continue
  }

  const raw = JSON.parse(fs.readFileSync(absPath, 'utf8'))
  const normalized = normalizeStack(raw)

  if (write) {
    fs.writeFileSync(absPath, JSON.stringify(normalized, null, 2) + '\n')
    console.log(`WROTE: ${relPath}`)
  } else {
    console.log(`OK (dry-run): ${relPath} → ${normalized.questions.length} questions`)
  }
}

if (!write) {
  console.log('\nDry run complete. Pass --write to update files.')
}
