# What makes a great stack

A stack is great when a fan finishes it and wants to tell someone. That happens when it does four things: it **hooks** them, **pays off** every answer, **rewards fans** with deep cuts, and **lands a turn** by level 5. Accuracy and fairness are the floor, not the goal.

Our best stacks today, to copy from: **Queso Wars**, **Serena Williams**, **Actually: Van Gogh Myths Busted**, **Ancient Greece**, **Where Gandalf Came From**.

## The rubric (score each 0–2; 12+ of 16 ships)

| | 0 — weak | 1 — fine | 2 — great |
|---|---|---|---|
| **Hook** (level 1) | Obscure, or a résumé fact anyone could skip | Easy and on-topic | Easy *and* intriguing: it opens a story ("won a major while secretly pregnant") |
| **Chain** | Five unrelated facts | Each question names the last answer | Each answer *opens a door* the player wants to walk through |
| **Payoff** (explanations) | Missing or restates the answer | One true sentence of context | A surprising detail, a quote, or a "that's why…" that makes the answer stick |
| **Fan delight** | Wikipedia-summary facts | One deep cut | Levels 3–5 reward real fans: quotes, behind-the-scenes, inside jokes, the detail only devotees know |
| **Humor and voice** | Dry, textbook phrasing | Clear and friendly | A wink in at least two places: playful wording, a delicious irony, a perfect quote |
| **The turn** (level 5) | Just the hardest fact | A satisfying ending | A twist that reframes the story (Cotton missed his own cheese-dip victory; Gandalf was first a dwarf) |
| **Fairness** | Ambiguous, two right answers, or the answer is in the question | Fair, one right answer | Fair, typeable, and the decoys are tempting misconceptions |
| **Accuracy** | Unverified or popular myth stated as fact | Correct | Correct, and contested points are flagged in the explanation |

## Writing explanations (the reveal card)

The explanation is shown right after the answer, win or lose. It is the reward.

- **One or two sentences, 80–220 characters.** Long enough to delight, short enough to read aloud at a bar.
- **Add something new.** Never restate the question. Give the surprising detail, the quote, the number, the consequence.
- **Bridge forward when you can.** Hint at why the next question matters, without naming its answer.
- **Use the fan's language.** Character names, catchphrases, episode titles, stats people argue about.
- **One wink is plenty.** Irony and real quotes beat jokes we invent. Never punch down.
- **Hedge honestly.** "He later claimed…", "the story goes…", "historians still argue…" when it's contested.

Good: *"Senator Tom Cotton picked the Twitter fight; Texas's Cruz and Cornyn accepted. On Dec. 7, 2016, Republican senators voted blind—and Arkansas won. Cotton missed it: his wife was in labor."*

Weak: *"Released in 1963, it launched Beatlemania."* (true, but generic)

## Fan delight by genre

- **TV and movies:** catchphrases, episode names, behind-the-scenes facts (a real horse head from a dog-food plant), actors' improvised lines, props.
- **Sports:** the exact stat fans argue about, the rival, the near miss, what happened right after the famous moment.
- **History and science:** the human detail (Curie's notebooks are still radioactive), the myth vs. the record, the unexpected connection.
- **Music and art:** the session story, the one-take legend, what the artist said about it.
- **Kids:** wow-numbers and gross-cool facts ("a pigeon is a distant cousin of T. rex"), friendly words, nothing scary.

## Checks the validator enforces

`npm run validate:stacks` fails a stack that is missing explanations, choices, or a fair chain, or that gives away an answer. It can't judge humor, fan delight, or the turn. Those take a human (or careful editor) reading the stack aloud and asking: *would a fan grin?*
