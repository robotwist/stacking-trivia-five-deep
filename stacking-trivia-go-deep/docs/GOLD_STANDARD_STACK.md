# Gold Standard Stack

Every playable DeepStack must follow this 5-level **story-unlock** model. The canonical example is **Vincent van Gogh** (`src/data/stacks/van-gogh.json`).

For archetypes (biography chapter, origin dispute, rebel arc), story briefs, and pilot stacks, see **[NARRATIVE_STACK_DESIGN.md](./NARRATIVE_STACK_DESIGN.md)**.

## The model

Each stack is **one micro-narrative** that unfolds in five beats. Each question must build on the **previous answer**—not just the same topic.

| Level | Purpose | Question style | Answer style |
|-------|---------|----------------|--------------|
| 1 | Recognition | Who/what is this? | 1–3 words, widely known |
| 2 | Context | Count, era, role tied to L1 | Short, factual |
| 3 | Specific | Named work/event/person from L2 | Proper noun |
| 4 | Insider | Who/where/when detail from L3 | Realistic proper noun |
| 5 | Expert | Precise number/date/term from L4 | Verifiable, narrow |

## Canonical example (Van Gogh)

```
L1: Who painted 'The Starry Night'?           → Vincent van Gogh
L2: How many paintings did van Gogh sell?     → One
L3: Title of the only painting sold alive?    → The Red Vineyard
L4: Who bought 'The Red Vineyard'?            → Anna Boch
L5: How much did Anna Boch pay in 1890?       → 400 francs
```

Each level references the prior answer's entity (van Gogh → one sale → Red Vineyard → Anna Boch → 400 francs).

## Required JSON schema

```json
{
  "title": "Stack Title",
  "description": "One-line narrative hook",
  "questions": [
    {
      "level": 1,
      "question": "Question text",
      "answer": "Canonical display answer",
      "acceptedAnswers": ["variant1", "variant2"],
      "hint": "optional",
      "explanation": "optional, shown after correct"
    }
  ],
  "deeperMode": {
    "title": "optional bonus round",
    "questions": []
  }
}
```

## Rules

1. **Exactly 5 questions** with `level` 1–5 (monotonic).
2. **Narrative chain**: Q(n) should reference a word from Q(n-1)'s answer (heuristic: answer token length > 3 appears in next question).
3. **Typeable answers**: canonical `answer` ≤ 50 characters; long context goes in `explanation`.
4. **acceptedAnswers**: minimum 3 variants including common misspellings and number formats.
5. **No contradictory alternates** (e.g. do not accept both "Theo" and "Anna Boch" as buyer).
6. **No answer leakage**: answer text must not appear in the question, `description`, or `imageHint`.
7. **No breadth jumps**: avoid "another", "switching to", "meanwhile" in questions.

## Anti-patterns

| Bad | Why |
|-----|-----|
| L3 asks about illness after L2 was about a painting sale | Breaks narrative thread |
| Essay-length answers (100+ chars) | Unfair for typed input |
| Accepting myth answers alongside facts | Contradictory grading |
| Duplicate stack files with different facts | Player confusion |
| MCQ-only stacks with no acceptedAnswers | Poor typo tolerance |

## Validation

Run before commit:

```bash
npm run validate:stacks
```

Or lint a single file:

```bash
node tools/stackLint.js src/data/stacks/van-gogh.json
```
