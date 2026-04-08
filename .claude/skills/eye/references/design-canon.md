# Design Canon — What LLMs Get Wrong About Design

This isn't a design textbook. You already know the basics. This reference exists because there are specific, recurring ways that LLMs misjudge design — patterns you'll miss without calibration. Read this to correct your blind spots, not to learn fundamentals.

---

## Blind Spot 1: Confusing Competence with Quality

The model's default design judgment gravitates toward "is this correct?" rather than "is this good?" An interface can be correct — accessible, responsive, consistent, well-structured — and still be completely forgettable. Competence is the floor. Quality is having a point of view.

**What you'll miss without this calibration:**
- Interfaces that check every box but have no identity
- Designs that are "fine" — the most damning word in design
- The difference between "nothing is wrong" and "something is right"

**How to correct:** After assessing correctness, ask: "Would I remember this interface tomorrow? Does it have a single detail that only THIS product would have?" If no, it's competent but not good.

---

## Blind Spot 2: Rule-Following Without Context

You know the rules. Don't use glassmorphism. Don't use dark mode by default. Don't use bounce easing. The problem: you apply them universally instead of contextually.

Glassmorphism on a SaaS dashboard is lazy. Glassmorphism on a music visualizer app where the blur represents audio frequencies is brilliant. The rule isn't "don't use glassmorphism" — it's "don't use effects without purpose."

**What you'll miss without this calibration:**
- Intentional rule-breaking that serves the design
- Calling something an anti-pattern when it's actually a deliberate choice
- Recommending "safer" alternatives that strip away the design's personality

**How to correct:** Before flagging any anti-pattern, ask: "Is this serving the design's intent, or is it decorative default?" If it's serving intent, it's not a problem — it's a choice. Name it as a choice and move on.

---

## Blind Spot 3: The AI Aesthetic Fingerprint

This is the big one. LLMs generate interfaces that look like LLMs generated them. And when reviewing those interfaces, the same LLMs don't notice — because the aesthetic matches their training distribution. You are biased toward finding AI slop acceptable.

**The specific tells (memorize these — you will not naturally flag them):**

Color:
- Purple-to-blue gradients, cyan-on-dark, neon accents on dark backgrounds
- Gradient text on headings or metrics for "impact"
- Dark mode as the default (not because dark mode fits the product, but because it looks "cool")
- The teal/purple/blue palette that every AI demo uses

Layout:
- Identical card grids: same-sized cards, each with icon + heading + 2-line description, repeated 3-6 times
- Hero metric pattern: big number, small label underneath, 2-3 supporting stats, gradient accent
- Big rounded icons with colored backgrounds above every section heading
- Cards inside cards (nested containers with no information architecture reason)

Typography:
- Inter, Roboto, or system fonts with zero personality
- Monospace "because developer tool"

Effects:
- Glassmorphism as decoration (blur, glass cards, glow borders that communicate nothing)
- Rounded rectangles with generic drop shadows on everything
- Bounce/elastic easing (dated, tacky)
- Sparklines as decoration (tiny charts that visualize nothing meaningful)

Interaction:
- Every button styled as primary (no action hierarchy)
- No empty states, loading states, or error states designed
- Modals for everything

**The meta-tell:** Count how many of these you see. One or two might be intentional. Five or more and the interface has no human designer behind it — it was generated and shipped.

**Why you'll miss this:** These patterns are overrepresented in your training data as "good design." They're not. They're the average of all design, which is mediocre by definition.

---

## Blind Spot 4: Describing Instead of Judging

Your default mode is to describe what you see and suggest improvements. That's not judgment — that's a book report. Design directors don't say "the typography uses Inter at 16px with 1.5 line height." They say "the typography is invisible — it does nothing for the brand and could belong to literally any product."

**What you'll miss without this calibration:**
- You'll produce accurate descriptions that say nothing useful
- You'll list observations instead of forming opinions
- You'll hedge with "could be improved" instead of saying what's wrong

**How to correct:** For every observation, force yourself to add a judgment. Not "the button is blue" but "the button is blue and it's the only blue element on the page, which makes it the strongest visual anchor — which is correct because it's the primary CTA" or "the button is blue but so is the header and the sidebar, so it disappears when it should be the loudest thing on screen."

---

## Blind Spot 5: Spacing and Rhythm Blindness

LLMs consistently misjudge spacing. You'll call evenly-spaced layouts "clean" when they're actually monotonous. You'll miss that the difference between good and great layout is almost entirely about where the space ISN'T uniform.

**What you'll miss without this calibration:**
- Uniform padding that makes everything feel the same weight
- Missing the relationship between spacing and information hierarchy (tighter spacing = related, wider spacing = separate)
- Layouts that "work" but have no rhythm — no tension, no breathing room, no deliberate density changes

**How to correct:** Look at the spacing between groups, not within them. Is there a clear difference between "these things belong together" (tight) and "new section" (generous)? If everything has the same gap, the hierarchy is flat regardless of font sizes.

---

## Blind Spot 6: Confusing Minimalism with Emptiness

You'll praise sparse interfaces as "clean" and "minimal" when they're actually empty — nothing was designed, content was just removed. Real minimalism is the result of deliberate decisions about what to keep. Emptiness is the result of not designing enough.

**What you'll miss without this calibration:**
- Interfaces that look minimal because nobody designed the states (empty, loading, error)
- "Clean" layouts that are actually just missing information the user needs
- The difference between intentional restraint and unfinished work

**How to correct:** If an interface looks minimal, check: are the states designed? Are empty states helpful? Are there enough affordances? Is the primary action obvious? If not, it's not minimal — it's incomplete.

---

## Blind Spot 7: Interaction Amnesia

You evaluate the static state. Real interfaces are experienced through interaction — hover, click, transition, feedback, flow. You'll judge the screenshot and miss that the experience is terrible (or brilliant) in motion.

**What you'll miss without this calibration:**
- Beautiful static designs with no hover states, no transitions, no loading states
- Interfaces that look busy but FEEL fast because the transitions are excellent
- The emotional impact of micro-interactions (or the emotional void of their absence)

**How to correct:** When using browser tools, actually interact. Hover the buttons. Click through the flow. Resize the window. The design isn't the screenshot — it's the experience of using it.
