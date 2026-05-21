import { describe, it, expect } from 'vitest'
import { PLAYABLE_STACK_REGISTRY } from '../data/playableStacks.manifest.js'
import { PLAYABLE_STACK_PATHS } from '../../tools/playableStacksManifest.js'
import { getPlayableStackKeys, loadPlayableStacks } from '../data/loadPlayableStacks.js'

describe('playable stacks registry', () => {
  it('manifest paths align with registry length', () => {
    expect(PLAYABLE_STACK_PATHS.length).toBe(PLAYABLE_STACK_REGISTRY.length)
  })

  it('loadPlayableStacks resolves every registry entry', () => {
    const stacks = loadPlayableStacks()
    const keys = getPlayableStackKeys()
    expect(Object.keys(stacks).length).toBe(keys.length)
    for (const key of keys) {
      expect(stacks[key]?.questions?.length).toBe(5)
    }
  })
})
