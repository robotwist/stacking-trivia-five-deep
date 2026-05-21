#!/usr/bin/env node
/**
 * Validate all playable stack JSON files (gameStacks manifest).
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PLAYABLE_STACK_PATHS } from './playableStacksManifest.js'
import { validateRawStack } from './stackValidator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

let failed = 0
let passed = 0

console.log('🔍 Validating playable stacks...\n')

for (const relPath of PLAYABLE_STACK_PATHS) {
  const absPath = path.join(root, relPath)
  if (!fs.existsSync(absPath)) {
    console.log(`❌ MISSING: ${relPath}`)
    failed++
    continue
  }

  const raw = JSON.parse(fs.readFileSync(absPath, 'utf8'))
  const { valid, errors, warnings } = validateRawStack(raw)

  if (valid && warnings.length === 0) {
    console.log(`✅ ${relPath}`)
    passed++
  } else if (valid) {
    console.log(`⚠️  ${relPath} (${warnings.length} warnings)`)
    warnings.forEach((w) => console.log(`     ${w}`))
    passed++
  } else {
    console.log(`❌ ${relPath}`)
    errors.forEach((e) => console.log(`     ${e}`))
    failed++
  }
}

console.log(`\n📊 ${passed} passed, ${failed} failed (${PLAYABLE_STACK_PATHS.length} total)`)
process.exit(failed > 0 ? 1 : 0)
