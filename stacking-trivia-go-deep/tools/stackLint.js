#!/usr/bin/env node
/**
 * Lint a single stack JSON file against gold-standard gates.
 * Usage: node tools/stackLint.js path/to/stack.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { validateRawStack } from './stackValidator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node tools/stackLint.js <stack.json>')
  process.exit(1)
}

const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
const raw = JSON.parse(fs.readFileSync(absPath, 'utf8'))
const { valid, errors, warnings } = validateRawStack(raw)

console.log(`\n📋 ${path.basename(absPath)}`)
if (errors.length) {
  console.log('\n🚨 Errors:')
  errors.forEach((e) => console.log(`   - ${e}`))
}
if (warnings.length) {
  console.log('\n⚠️  Warnings:')
  warnings.forEach((w) => console.log(`   - ${w}`))
}
if (valid) {
  console.log('\n✅ Stack passes validation')
  process.exit(0)
} else {
  console.log('\n❌ Stack failed validation')
  process.exit(1)
}
