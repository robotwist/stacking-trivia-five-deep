# Soft launch checklist

Use this when friends host a night or you leave Deploy Preview for a wider invite.

## 1. Play on the right URL

- **Dev / PR preview:** [Deploy Preview for PR #1](https://deploy-preview-1--stacking-trivia-five-deep.netlify.app) (or the latest preview for `dev`)
- **Production** (`stacking-trivia-five-deep.netlify.app`) lags until you promote `production-build` — Brunson, Nebraska triple, Go Deep copy, etc. live on preview first

Hard-refresh or clear the PWA cache if the UI looks stale.

## 2. Turn on PostHog (5 minutes)

Nothing is measured until a key is set. Follow [ANALYTICS.md](ANALYTICS.md):

1. Create a PostHog project; copy the `phc_` token
2. Netlify → Environment variables → `VITE_POSTHOG_KEY` (all contexts)
3. Optional EU: `VITE_POSTHOG_HOST=https://eu.i.posthog.com`
4. Trigger a preview build

Watch first: share rate by stack, miss rate by level, Host Night finishes.

## 3. Host one night

1. Open **Host Night** (more modes / host entry)
2. Leave **Go Deep rule** on (one miss sits a team out — late swings)
3. Pick 4–6 stacks across categories; include one Nebraska triple stack if locals are present
4. Afterward: note which stack died by level 3 and which got “tell someone”

Host Pass signup (founding hosts) is the Netlify form path — keep an eye on form quota if you’re still on the free plan.

## 4. Netlify credits

Site plan is free-tier (`nf_team_dev`). Deploy Previews are the cheap path. Production publishes are the scarce ones — upgrade to Netlify Personal when you’re ready to point friends at the main URL without babysitting builds.

## 5. After the first night

1. Rewrite any level that mass-missed for the wrong reason (unfair, not hard)
2. Clone what got shared (legendary-night / one-scene craft — see [STACK_QUALITY.md](STACK_QUALITY.md))
3. Only then add new triples or categories
