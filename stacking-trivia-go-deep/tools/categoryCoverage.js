/**
 * Cross-check categories.json against the playable stack registry.
 *
 * @param {{ categories: Record<string, { stacks: string[] }> }} categoriesConfig
 * @param {{ key: string }[]} registry
 * @returns {{ unknownKeys: { category: string, key: string }[], uncategorizedKeys: string[] }}
 */
export function findCategoryManifestMismatches(categoriesConfig, registry) {
  const playable = new Set(registry.map(({ key }) => key))
  const listed = new Set()
  const unknownKeys = []

  for (const [category, { stacks = [] }] of Object.entries(categoriesConfig.categories || {})) {
    for (const key of stacks) {
      listed.add(key)
      if (!playable.has(key)) unknownKeys.push({ category, key })
    }
  }

  const uncategorizedKeys = [...playable].filter((key) => !listed.has(key))
  return { unknownKeys, uncategorizedKeys }
}
