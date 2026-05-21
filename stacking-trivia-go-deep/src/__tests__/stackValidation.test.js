import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PLAYABLE_STACK_PATHS } from '../../tools/playableStacksManifest.js'
import { validateRawStack } from '../../tools/stackValidator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '../..')

describe('playable stack validation', () => {
  it('all gameStacks JSON files pass gold-standard gates', () => {
    const failures = []

    for (const relPath of PLAYABLE_STACK_PATHS) {
      const absPath = path.join(root, relPath)
      const raw = JSON.parse(fs.readFileSync(absPath, 'utf8'))
      const { valid, errors } = validateRawStack(raw)
      if (!valid) {
        failures.push({ relPath, errors })
      }
    }

    if (failures.length > 0) {
      const msg = failures.map((f) => `${f.relPath}:\n  ${f.errors.join('\n  ')}`).join('\n')
      expect.fail(`${failures.length} stack(s) failed validation:\n${msg}`)
    }

    expect(PLAYABLE_STACK_PATHS.length).toBeGreaterThan(0)
  })
})
