# DeepStack documentation

## Authoritative (use these)

| Document | Audience |
|----------|----------|
| [../README.md](../README.md) | Product vision, Van Gogh example, repo layout |
| [../stacking-trivia-go-deep/README.md](../stacking-trivia-go-deep/README.md) | Install, scripts, deploy |
| [../stacking-trivia-go-deep/docs/NARRATIVE_STACK_DESIGN.md](../stacking-trivia-go-deep/docs/NARRATIVE_STACK_DESIGN.md) | **Story-unlock strategy** (archetypes, briefs, pilots) |
| [../stacking-trivia-go-deep/docs/GOLD_STANDARD_STACK.md](../stacking-trivia-go-deep/docs/GOLD_STANDARD_STACK.md) | **Content contract** (5 levels, schema, validation) |
| [../stacking-trivia-go-deep/docs/STACK_AUTHORING.md](../stacking-trivia-go-deep/docs/STACK_AUTHORING.md) | How to write stacks + `validate:stacks` |
| [../stacking-trivia-go-deep/ARCHITECTURE.md](../stacking-trivia-go-deep/ARCHITECTURE.md) | Code layout and runtime flow |
| [../BEST_PRACTICES.md](../BEST_PRACTICES.md) | Engineering standards |

## CI

From `stacking-trivia-go-deep/`:

```bash
npm run ci   # lint:quality + validate:stacks + test + build
```

GitHub Actions: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

## Archived

Historical plans and superseded frameworks: [archive/README.md](archive/README.md)

Stub pointers at old paths (`CONTENT_STRATEGY.md`, `DEEP_DIVE_QUALITY_FRAMEWORK.md`) redirect here.
