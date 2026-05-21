# Narrative Stack Design

**The product is the story.** Each playable stack is one micro-narrative that unlocks in five beats—not five harder facts about a topic.

Players should feel: *I didn't know that → and that leads here → and now it all clicks.*

---

## Story archetypes

Use these alongside the level table in [GOLD_STANDARD_STACK.md](./GOLD_STANDARD_STACK.md).

| Archetype | Spine | L1 should feel like… | Examples in repo |
|-----------|--------|----------------------|------------------|
| **Artifact chain** | One object/record narrows step by step | "Who made this famous work?" | Van Gogh (sale → painting → buyer → price) |
| **Biography chapter** | One chapter of a life, not a résumé | "What happened in this moment?" | Serena (secret pregnancy → Olympia) |
| **Origin dispute** | Two claims, evidence narrows | "What are they fighting over?" | Queso Wars (TX vs AR) |
| **Rebel arc** | Rise → system clash → legacy | "Who shook the establishment?" | Prefontaine (Hayward → Nike → MGB → Classic) |

Categories are **shelves** (Sports, Actually, History). The stack is **one tale**.

---

## Story brief (authoring template)

Before writing JSON, fill this in (keep in your notes or optional `storySpine` metadata):

```
Title hook:     (player-facing title)
Spine:          (one sentence: what unfolds in 5 beats)
Turn:           (emotional or factual surprise by L5)
L1 must NOT assume:  (answers from L3–L5)
Forbidden in description / imageHint:  (any answer tokens)
```

**Bad spine:** "Five Serena facts" (majors → US Open → Venus → …)  
**Good spine:** "She won a major while pregnant—how the secret became Olympia"

---

## Unlock chain rules

1. **L1 sets the story**, not the most famous number on Wikipedia.
2. **Each question uses the previous answer** as a door (name it in the question text when natural).
3. **`explanation`** carries context; **`answer`** stays short and typeable.
4. **Descriptions and `imageHint`** are visible before Q1—no spoilers (enforced by `validate:stacks`).
5. **Deeper Mode** is optional; use it for a *second* story (e.g. Serena career stats), not leftovers from the main spine.

---

## Pilot stacks (narrative-first)

| Stack | File | Archetype |
|-------|------|-----------|
| Van Gogh | `src/data/stacks/van-gogh.json` | Artifact chain |
| Serena | `src/data/categories/sports/serena-williams.json` | Biography chapter |
| Queso Wars | `src/data/categories/actually/queso-wars.json` | Origin dispute (feud → Cotton → NLR → Rotel → 1943) |
| Prefontaine | `src/data/categories/sports/prefontaine-ultimate.json` | Rebel arc |

---

## Human architect vs generator

- **You:** story brief, fact-check, emotional turn, forbid spoilers.
- **Generator:** draft variants, `acceptedAnswers`, alt phrasing—then **you** own the spine.
- **CI:** `npm run validate:stacks` catches schema, leakage, and weak chains (warnings)—not substitute for editorial judgment.

---

## Related docs

- [GOLD_STANDARD_STACK.md](./GOLD_STANDARD_STACK.md) — schema and Van Gogh canonical chain
- [STACK_AUTHORING.md](./STACK_AUTHORING.md) — workflow and tools
