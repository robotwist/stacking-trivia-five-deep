# Analytics: which stacks are actually fun

Deeply Trivial sends a handful of anonymous game events to [PostHog](https://posthog.com) (free up to 1 million events a month, commercial use allowed). Nothing is sent until you add a key.

## Turn it on (5 minutes)

1. Sign up at posthog.com and create a project (US or EU cloud).
2. Copy the **Project token** (starts with `phc_`) from Project settings.
3. In Netlify: **Project configuration → Environment variables**, add `VITE_POSTHOG_KEY` = your token, for all deploy contexts. If you chose EU cloud, also add `VITE_POSTHOG_HOST` = `https://eu.i.posthog.com`.
4. The next build (a free preview build counts) starts sending events.

## Privacy

Each player is a random anonymous id stored on their device. We never send names, emails, typed answers, or URL query strings (challenge links contain names). Browsers with "Do Not Track" on send nothing.

## Events

| Event | When | Key properties |
|---|---|---|
| `app opened` | Every launch | `entry` (home, link, challenge, daily-shortcut), `installed` |
| `stack started` | A run begins | `stack`, `source` (daily, surprise, category, challenge, suggestion, replay, resume, link) |
| `level answered` | Every answer | `stack`, `level`, `correct`, `used_choices`, `answered_by` (typing or choice) |
| `stack finished` | Results screen | `stack`, `score`, `levels_cleared`, `perfect`, `choices_used`, `first_play`, `is_daily`, `beat_challenge` |
| `result shared` | Challenge a friend | `stack`, `outcome` (shared, copied), `reply` |
| `story revealed` | "Reveal the rest of the story" | `stack`, `levels_unseen` |
| `feedback sent` | Error report or rating | `stack`, `rating`, `category` |
| `install prompted` | Install button | `outcome`, `platform` |
| `host night started` / `finished` | Host Night | `teams`, `rounds`, `dive_rule`, `show_choices`, `tv_screen` |
| `host pass signup` | Founding host form | `host_type`, `nights_per_month` (never the email) |

## The five insights to build first

1. **Fun leaderboard:** `stack finished` broken down by `stack`, showing the share rate (`result shared` ÷ `stack finished`) and replay rate (`source = replay`). Stacks people share and replay are the model for new ones.
2. **Where stories break:** `level answered` with `correct = false`, broken down by `stack` and `level`. A level most players miss is either too hard or unfair: rewrite it. A level nobody misses at level 4–5 is too easy.
3. **Lifeline pressure:** share of `level answered` with `used_choices = true` by level. If most people need choices at level 2, the curve is too steep.
4. **Curiosity:** `story revealed` ÷ finished runs that missed a level. High means the story hooked them even after they lost.
5. **Retention:** PostHog's retention insight on `app opened`, day 1 and day 7. This is the number that decides whether the game can be sold.

Rubric scores in [STACK_QUALITY.md](STACK_QUALITY.md) are the editorial prediction; these numbers are the verdict.
