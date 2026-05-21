# Stack Authoring Guide

How to create and maintain DeepStack trivia content. See also the [documentation index](../../docs/README.md) at the repo root.

## Quick start

1. Read [NARRATIVE_STACK_DESIGN.md](./NARRATIVE_STACK_DESIGN.md) for story archetypes and the story-brief template.
2. Read [GOLD_STANDARD_STACK.md](./GOLD_STANDARD_STACK.md) for the 5-level schema and rules.
3. Copy `src/data/stacks/van-gogh.json` (artifact chain) or a pilot stack (Serena, Queso Wars, Prefontaine) as your template.
4. Lint before commit:

```bash
node tools/stackLint.js src/data/stacks/your-stack.json
```

5. Validate all playable stacks:

```bash
npm run validate:stacks
```

## Schema

Every question must include:

| Field | Required | Notes |
|-------|----------|-------|
| `level` | Yes | 1–5, monotonic |
| `question` | Yes | Should reference prior answer's entity |
| `answer` | Yes | ≤ 50 characters, typeable |
| `acceptedAnswers` | Yes | ≥ 3 variants, include typos and number formats |
| `hint` | No | Shown on request |
| `explanation` | No | Shown after a correct answer |

## Narrative chain rules

- **Pick one spine** before writing (see [NARRATIVE_STACK_DESIGN.md](./NARRATIVE_STACK_DESIGN.md)).
- **Level 1**: Opens the story—not the most famous résumé fact.
- **Levels 2–5**: Each question narrows using the previous answer; add `explanation` for the reveal.
- Do not jump topics mid-stack (no "another artist" or "switching to").
- Do not accept contradictory answers (e.g. two different buyers).

## Descriptions must not spoil answers

The `description` and `imageHint` are visible **before** the first question. Do not use “From X to Y” teasers where X or Y are answers. Hook the topic without naming facts players should discover.

Bad: `From 23 majors to Venus—five steps through the GOAT's career`  
Good: `Grand slam greatness, family, and life beyond the court—five tennis depths.`

## Answer realism

- Prefer facts verifiable in reputable sources.
- Keep canonical answers short; put context in `explanation`.
- Include common misspellings in `acceptedAnswers` rather than loosening global fuzzy rules.

## Tools

| Command | Purpose |
|---------|---------|
| `npm run validate:stacks` | CI gate for all playable stacks (main + deeperMode questions) |
| `npm run ci` | Full CI pipeline (see repo `.github/workflows/ci.yml`) |
| `node tools/stackLint.js <file>` | Lint one stack |
| `node tools/migrateStacks.js --write` | Normalize legacy `q`/`a` format |
| `node tools/applyStackContentFixes.js` | Apply bundled narrative fixes (dev) |

## Adding a new playable stack

1. Create JSON under `src/data/stacks/` or `src/data/categories/<category>/`.
2. Add `{ key, module }` to [`src/data/playableStacks.manifest.js`](../src/data/playableStacks.manifest.js).
3. Add the `key` to [`src/data/categories.json`](../src/data/categories.json) under the category’s `stacks` array.
4. Run `npm run validate:stacks`.

No imports in `App.jsx` — stacks load via [`loadPlayableStacks.js`](../src/data/loadPlayableStacks.js).

## Playtest input modes

- Default: **type your answer** (with fuzzy matching).
- Optional: **Show answer choices** toggle reveals MCQ hints (stored in `localStorage` as `deepstack_answer_input_mode`).
