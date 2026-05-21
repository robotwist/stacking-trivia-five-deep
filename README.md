# DeepStack (Stacking Trivia: Go Deep)

Bar- and group-friendly trivia where each round **unlocks one story** in **five linked questions**—not five random facts on a topic. Answer each level correctly to keep diving; scoring doubles per level (10 → 20 → 40 → 80 → 160). Wrong answer ends the run.

**Content strategy:** Stacks are hand-architected micro-narratives (Serena’s secret pregnancy, Texas–Arkansas queso feud, Prefontaine’s rebel arc). See [NARRATIVE_STACK_DESIGN.md](stacking-trivia-go-deep/docs/NARRATIVE_STACK_DESIGN.md).

The shipped UI title is **Deeply Trivial**; the product name in docs is **DeepStack**.

---

## Core loop (implemented)

1. Choose a category and stack (45+ playable stacks in JSON).
2. Answer five linked questions — each level should build on the previous answer.
3. Type your answer (fuzzy matching for typos); optional “Show answer choices” for MCQ hints.
4. Optional **Deeper Mode** after a perfect run (where the stack defines bonus questions).
5. Host, projector, and bar modes exist for group play.

**Not required for every stack:** photo-first opening (`photoFirst` on select stacks only).

**Auth:** **Play as Guest** works without an API (bundled JSON). Sign-in optional for cloud progress and leaderboards. Deep link: `/play?stack=<key>&category=<key>`.

---

## Canonical example: Van Gogh

This is the gold-standard chain ([`stacking-trivia-go-deep/src/data/stacks/van-gogh.json`](stacking-trivia-go-deep/src/data/stacks/van-gogh.json)):

| Level | Question | Answer |
|-------|----------|--------|
| 1 | Who painted *The Starry Night*? | Vincent van Gogh |
| 2 | How many paintings did van Gogh sell in his lifetime? | One |
| 3 | Title of the only painting sold while alive? | The Red Vineyard |
| 4 | Who bought *The Red Vineyard*? | Anna Boch |
| 5 | How much did Anna Boch pay in 1890? | 400 francs |

Descriptions and image hints must **not** spoil answers (e.g. do not write “23 majors” in the blurb if Q1 asks for that count).

---

## Documentation

| Doc | Path |
|-----|------|
| **Content contract** | [`stacking-trivia-go-deep/docs/GOLD_STANDARD_STACK.md`](stacking-trivia-go-deep/docs/GOLD_STANDARD_STACK.md) |
| **Authoring guide** | [`stacking-trivia-go-deep/docs/STACK_AUTHORING.md`](stacking-trivia-go-deep/docs/STACK_AUTHORING.md) |
| **Doc index** | [`docs/README.md`](docs/README.md) |
| **Archived (historical)** | [`docs/archive/README.md`](docs/archive/README.md) |
| **Development** | [`stacking-trivia-go-deep/README.md`](stacking-trivia-go-deep/README.md) |
| **Architecture** | [`stacking-trivia-go-deep/ARCHITECTURE.md`](stacking-trivia-go-deep/ARCHITECTURE.md) |

## CI

From `stacking-trivia-go-deep/`: `npm run ci` (lint quality core, validate all stacks, tests, build). GitHub Actions: [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Repository layout

```
stacking-trivia-go-deep/     # React + Vite app (run npm commands here)
  src/data/stacks/           # Canonical stack JSON
  src/data/categories/       # Categorized stack JSON
  tools/                     # validate:stacks, stackLint, migrate
  docs/                      # GOLD_STANDARD_STACK, STACK_AUTHORING
README.md                    # This file — product overview
```

---

## Goals

- Replace shallow bar trivia with layered, literate stacks.
- Reward curiosity and fair typed answers (not trick questions in the description).
- Scale from bars to classrooms; host/projector modes for groups.

## Aspirational (partially built)

- Branch back to a prior node and dive on a tangent.
- Regional stack every session; performance finale.
- Database-driven content loader (stacks still wired in `App.jsx` today).

---

## Tech (current)

- **Frontend:** React 19, Vite 7, Tailwind
- **Content:** JSON + `normalizeStack` at load; `npm run validate:stacks`
- **Deploy:** Netlify (static frontend); API/backend separate (see app `README` for Railway/Heroku notes)
