# DeepStack — application

React + Vite trivia client. Product overview and content rules live in the [repo root README](../README.md) and [`docs/`](docs/).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5170 or :3000 per vite config
npm run validate:stacks
npm run test:run
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run test:run` | Vitest (includes playable stack validation) |
| `npm run validate:stacks` | Gold-standard gates on all playable JSON stacks (manifest-driven) |
| `npm run ci` | lint:quality + validate:stacks + test + build (matches GitHub Actions) |
| `npm run stacks:lint` | Lint one file: `npm run stacks:lint -- src/data/stacks/van-gogh.json` |
| `npm run stacks:migrate` | Normalize legacy `q`/`a` JSON to standard schema (`--write` via tool) |
| `npm run lint` | ESLint |

## Content authoring

Read before editing JSON:

1. [`docs/GOLD_STANDARD_STACK.md`](docs/GOLD_STANDARD_STACK.md)
2. [`docs/STACK_AUTHORING.md`](docs/STACK_AUTHORING.md)

Adding a playable stack: create JSON → register in [`src/data/playableStacks.manifest.js`](src/data/playableStacks.manifest.js) → add key to `categories.json` → `npm run validate:stacks`.

## Runtime flow

1. **Auth** — sign in, or **Play as Guest** (no API; progress on device). Deep links `/play?stack=queso-wars` auto-start guest mode.
2. **Selection** — category → stack from `gameStacks` (each stack passed through `normalizeStack`).
3. **Play** — [`GameStack.jsx`](src/components/GameStack.jsx): typed answers, optional MCQ hint toggle, levels 1–5, exponential score.
4. **API** (optional) — auth/progress when `VITE_API_BASE_URL` points at a backend; trivia still loads from bundled JSON.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for module layout.

## Deployment

- **Netlify:** build `npm run build`, publish `dist/`, set `VITE_API_BASE_URL` if using a remote API.
- **Heroku / Railway:** see `HEROKU_SETUP.md`, `HEROKU_QUICK_DEPLOY.md` (backend + env vars).

Frontend-only deploy does not serve `/api/*`; use **Play as Guest** or set `VITE_API_BASE_URL` for accounts.

## Historical docs in this folder

Files like `CONTENT_STRATEGY.md`, `PHASE_*.md`, and `REFACTOR_SUMMARY.md` are snapshots. Prefer root [`docs/README.md`](../docs/README.md) for what is authoritative today.
