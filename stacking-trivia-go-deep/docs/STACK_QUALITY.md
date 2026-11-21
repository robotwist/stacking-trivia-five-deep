# What makes a great stack

A stack is great when a fan finishes it and wants to tell someone. That happens when it does four things: it **hooks** them, **pays off** every answer, **rewards fans** with deep cuts, and **lands a turn** by level 5. Accuracy and fairness are the floor, not the goal.

**Voice:** Say **Go Deep**, not “dive” / “deep dive.” “Dive deep into a subject” is a business cliché. Go Deep is the product language (and a football throw).

Our best stacks today, to copy from: **Queso Wars**, **Serena Williams**, **1984 Orange Bowl**, **Michael Jordan: The Last Shot**, **Where Gandalf Came From**.

### Sports: legendary-possession chains

For sports fans, prefer **one famous night** over a résumé. Jordan’s Last Shot and Nebraska’s 1984 Orange Bowl are the bar: who scored, who threw, who tipped, who left hurt, what the final was. College / hometown topics that locals clear by level 4 should become a **triple stack** (three linked five-level stories), not one easy five.

### Cinema / TV: one-scene chains

Same idea on screen: **one sequence**, not a filmography. Star Wars Death Star rescue and The Godfather horse’s head are the bar—prop, line, number, behind-the-scenes receipt. Open on the scene; put résumé facts (who directed) in Go Deeper if at all.

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

## Fan craft: what makes people wait for this trivia

Our audience is fans. A stack is dialed in when a devotee grins at least three times: at a wink in the wording, at a decoy that's an in-joke, and at a level-5 deep cut they're proud to know. The reference stack is **Star Wars: The Death Star Rescue**.

### The deep-track ladder

Every level should feel like going one layer further into the fandom.

| Level | Who gets it | Star Wars example |
|---|---|---|
| 1 | Anyone who saw it once | Which princess do they rescue? (Leia) |
| 2 | A fan | Luke's "prisoner transfer from cell block ___" (1138, Lucas's first film) |
| 3 | A superfan | Leia's cell number (2187, a tribute to the short film 21-87) |
| 4 | A deep-tracker | The trash-compactor creature's name (dianoga; the film never says it) |
| 5 | A devotee, with a payoff | The line that became the saga's running gag |

### The toolbox

- **Winks in the wording.** Quote the source inside the question ("one of them 'a little short'"). Fans hear the line in the actor's voice.
- **In-joke decoys.** Make the wrong choices real numbers, names, and lines from the same world (TK-421, Docking Bay 327, Docking Bay 94). Even a wrong guess should make a fan smile.
- **Deep cuts with receipts.** Behind-the-scenes facts in the creator's own words beat summaries ("I purposely made myself red-faced for a strangulated look"). Always find the primary quote; fandom myths get corrected loudly.
- **Callbacks across levels.** Let a later level pay off an earlier one (the cell-block bluff sets up the cell number).
- **The easter egg.** An optional `easterEgg` (`title`, `text`) is revealed only on a perfect Go Deep: the nod that rewards going all the way down (Finn's stormtrooper number is FN-2187, Leia's cell). Players who miss see that one exists, which pulls them back.

### Fan-craft checklist before shipping

- [ ] Would a casual fan get level 1, and would a devotee be proud to get level 5?
- [ ] Is there a quote or catchphrase in at least two questions?
- [ ] Are at least half the decoys in-world in-jokes rather than generic wrong answers?
- [ ] Is every behind-the-scenes claim sourced to the person who was there?
- [ ] Is there an easter egg worth finding?

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
- **Sports:** one legendary possession or quarter—who scored, who assisted, who tipped, the scoreboard beat fans still argue. Stats support the story; they are not the story.
- **History and science:** the human detail (Curie's notebooks are still radioactive), the myth vs. the record, the unexpected connection.
- **Music and art:** the session story, the one-take legend, what the artist said about it.
- **Kids:** wow-numbers and gross-cool facts ("a pigeon is a distant cousin of T. rex"), friendly words, nothing scary.

## Checks the validator enforces

`npm run validate:stacks` fails a stack that is missing explanations, choices, or a fair chain, or that gives away an answer. It can't judge humor, fan delight, or the turn. Those take a human (or careful editor) reading the stack aloud and asking: *would a fan grin?*
