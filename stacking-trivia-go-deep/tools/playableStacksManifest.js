/**
 * Node-side paths for validate:stacks — derived from src/data/playableStacks.manifest.js
 */
import { PLAYABLE_STACK_REGISTRY } from '../src/data/playableStacks.manifest.js'

export const PLAYABLE_STACK_PATHS = PLAYABLE_STACK_REGISTRY.map(({ module }) =>
  `src/data/${module.replace(/^\.\//, '')}`
)

export { PLAYABLE_STACK_REGISTRY }
