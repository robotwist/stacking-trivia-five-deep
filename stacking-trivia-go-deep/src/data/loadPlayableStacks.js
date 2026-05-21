import { PLAYABLE_STACK_REGISTRY } from './playableStacks.manifest.js'
import { normalizeStack } from '../utils/normalizeStack.js'

const stackModules = import.meta.glob(
  ['./stacks/*.json', './categories/**/*.json'],
  { eager: true }
)

/**
 * Build normalized gameStacks map from the central registry.
 */
export function loadPlayableStacks() {
  const stacks = {}

  for (const { key, module: modulePath } of PLAYABLE_STACK_REGISTRY) {
    const mod = stackModules[modulePath]
    if (!mod) {
      console.warn(`[loadPlayableStacks] Missing module for key "${key}": ${modulePath}`)
      continue
    }
    const raw = mod.default ?? mod
    stacks[key] = normalizeStack(raw)
  }

  return stacks
}

export function getPlayableStackKeys() {
  return PLAYABLE_STACK_REGISTRY.map((entry) => entry.key)
}
