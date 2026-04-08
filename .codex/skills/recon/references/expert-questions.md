# Expert Question Templates by Project Type

These are starting points. Adapt and extend based on the specific project. The goal is to generate questions a consultant who's built 10 of these would ask — not generic checklist items.

---

## Web Application (SaaS, Dashboard, Tool)

- What's the auth model, and does it need multi-tenancy from day 1 or can that be retrofitted?
- What's the data model decision you'll regret in 6 months?
- What's the real-time requirement, and can you defer it without users noticing?
- What happens when two users edit the same thing simultaneously?
- Where does the state actually live, and what happens when you need to move it?
- What's the performance cliff when the database hits 100k rows in your hottest table?
- What's the deployment story — can you ship 5 times a day without breaking sessions?

## API / Backend Service

- What's the contract stability promise — can clients rely on this or will it churn?
- What's the rate limiting and abuse story?
- What happens when a downstream dependency is slow or dead?
- What's the pagination model, and will it survive a table with 10M rows?
- What's the versioning strategy — URL, header, or content negotiation?
- What's the observability story — can you diagnose a problem from logs alone?
- What does graceful degradation look like?

## CLI Tool

- What's the error message quality bar — can a user fix the problem without googling?
- What's the config file story — where does it live, what format, what happens with conflicts?
- What's the upgrade path — can users update without breaking their workflow?
- What's the offline behavior?
- How does it compose with other tools (piping, exit codes, structured output)?
- What's the first-run experience for someone who's never seen this tool?

## Mobile App

- What's the offline-first story — what works without a connection?
- What happens when the user kills the app mid-operation?
- What's the push notification strategy — what's worth interrupting the user for?
- What's the deep linking model?
- What's the minimum OS version, and what features does that cut off?
- What's the update story — force update, soft nudge, or silent?
- What's the battery/data budget for background operations?

## E-Commerce / Marketplace

- What's the inventory model — can two users buy the last item simultaneously?
- What's the payment failure recovery flow?
- What's the refund/dispute model, and how does it affect your accounting?
- What's the search/filter model, and does it need full-text or faceted search from day 1?
- What's the pricing model complexity — simple prices, tiers, subscriptions, dynamic?
- What are the tax/compliance obligations for your target markets?
- What's the seller/buyer trust model?

## Real-Time / Collaborative

- What's the conflict resolution model — last-write-wins, OT, CRDT?
- What's the latency budget — what feels "instant" for this use case?
- What happens when a participant's connection is flaky?
- What's the presence model — do users need to see who else is active?
- What's the history/undo model?
- What's the reconnection story — does state survive a page refresh?
- What happens at 50 concurrent users on the same document?

## Developer Tool / Library

- What's the error message quality — can users self-diagnose?
- What's the escape hatch — can advanced users bypass your abstractions?
- What's the debugging story — can users inspect what your tool is doing?
- What's the migration path between major versions?
- What's the bundle size / dependency footprint, and does your audience care?
- What's the TypeScript story — first-class types or afterthought?

## Content / Media Platform

- What's the content moderation model?
- What's the storage/CDN strategy for media files?
- What's the transcoding pipeline — how many formats do you need?
- What's the content discovery model — algorithmic, editorial, social?
- What's the creator attribution and rights model?
- What's the embedding/sharing story?

## Data Pipeline / ETL

- What's the idempotency guarantee — can you safely re-run a failed job?
- What's the schema evolution story — what happens when upstream changes a field?
- What's the backfill strategy — can you reprocess historical data?
- What's the monitoring story — how do you know a pipeline is silently producing wrong data?
- What's the data quality validation model?
- What's the latency requirement — batch, micro-batch, or streaming?

## AI/ML Application (LLM wrapper, agent, ML-powered feature)

- What's the eval story — how do you know the model is producing good results vs. confidently wrong ones?
- What's the cost model — what happens to your bill when usage spikes 10x?
- What's the latency budget — can users wait 3 seconds for a response, or do you need streaming?
- What's the fallback when the model is down or rate-limited?
- What's the prompt/model versioning strategy — can you roll back without breaking behavior?
- What's the guardrails story — what happens when the model produces harmful, wrong, or off-topic output?
- What user data touches the model, and what are the privacy implications?

## Browser Extension

- What's the permissions model — are you requesting more than users are comfortable with?
- What happens when the target site changes its DOM structure?
- What's the cross-browser story — Chrome, Firefox, Safari have different APIs and review processes?
- What's the content script isolation model — can you conflict with the page or other extensions?
- What's the update/review pipeline — how long does store review take, and what blocks approval?
- What's the storage story — local vs sync vs server, and what happens when the user has 5 devices?

## Game / Interactive Experience

- What's the game loop architecture — fixed timestep, variable, or hybrid?
- What's the state serialization model — can you save/load/replay reliably?
- What's the input model — keyboard, touch, gamepad, and what happens when they're mixed?
- What's the asset pipeline — how do you go from artist output to engine-ready format?
- What's the performance budget — target frame rate, and what gets cut first when you miss it?
- What's the networking model (if multiplayer) — client-authoritative, server-authoritative, rollback?

## Design System / Component Library

- What's the theming model — CSS variables, runtime tokens, build-time, or all three?
- What's the breaking change policy — how do consumers upgrade without pain?
- What's the composition model — can users combine your primitives in ways you didn't anticipate?
- What's the accessibility baseline — WCAG AA or AAA, and is it enforced or aspirational?
- What's the documentation story — do examples stay in sync with the code?
- What's the versioning strategy for visual changes — is a color tweak a patch or a minor?

## Static Site / Blog / Documentation

- What's the build time story — how long at 1000 pages, and does incremental build work?
- What's the content authoring model — who writes, in what format, with what preview?
- What's the search story — client-side index, external service, or none?
- What's the i18n model — is multi-language a day-1 requirement or a retrofit?
- What's the image optimization pipeline — responsive sizes, formats, lazy loading?
- What's the deploy/preview story — can content authors see changes before publish?
