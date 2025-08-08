# 🧠 DeepStack: Trivia That Dares to Matter

**DeepStack** is not your average trivia game. It’s a dive into the meaningful, the absurd, and the wonderfully obscure — a radical rethinking of bar trivia for the curious, the cultured, and the courageously nerdy.

---

## 🔮 Concept

In DeepStack, players don’t just answer *one* trivia question — they go **five levels deep** on a subject. Each level uncovers more specificity, more absurdity, and more delight. You must answer correctly at each level to keep diving. The further you go, the richer the rewards (and the weirder the facts).

Every session starts with a visual prompt (think: a face, a logo, a landmark) and spirals downward — from the obvious to the esoteric. Think *Monty Python meets Jeopardy meets your smartest group chat*.

---

## ✨ Game Modes

### 🎲 Core Loop
1. **Image Reveal:** An image is shown. The first to guess the surface-level fact (e.g., "Who painted this?") starts the round.
2. **Stack Dive:** The group works through a 5-question stack on that subject — each one doubling the score from the last.
3. **Regional Stack:** Every group session includes a stack tied to regional/local knowledge (e.g., Nebraska Sports, Silicon Valley History).
4. **Performance Finale (optional):** Teams can write a rap, play, or song that synthesizes their stack knowledge for bonus points.

---

## 🧱 Example Stack: Van Gogh

1. Who painted *Starry Night*?
2. How many paintings did he sell in his lifetime?
3. Who did he sell it to?
4. How much was it sold for?
5. What was the occupation of the buyer?

---

## 🎯 Goals

- Replace boring bar trivia with something rich and layered.
- Reward true knowledge and curiosity.
- Create a format that can scale from bars to classrooms to livestreams.

---

## 💻 MVP / MDP Scope

- JSON-based stacks (5-question depth model).
- Local or hosted app that reads, displays, and scores stacks.
- Stack loader: manually or randomly assign stacks.
- Score multiplier logic (2x per depth level).
- Team/Player structure and leaderboard.
- Simple UI — mobile-first or projector-friendly.
- Optional performance upload/presentation mode.

---

## 🛠 Stack

- Frontend: React or Svelte (TBD based on iteration speed)
- Backend (optional for now): Node.js or Python Flask
- Deployment: Netlify (static) or Heroku (for backend-enabled version)
- Stack Storage: JSON files or light database
- Auth (later): Supabase or Firebase if needed

---

## 📂 Directory Example

