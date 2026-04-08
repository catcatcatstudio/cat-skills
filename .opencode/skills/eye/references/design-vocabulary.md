# Design Vocabulary — What Separates Good from Mediocre

This is the craft knowledge. The canon corrects how you think. This gives you something to think with.

---

## Typography: When It's Working

Good type hierarchy isn't about having different sizes. It's about **contrast between levels creating a reading order you don't have to think about.**

The gap between your largest heading and your body text should feel dramatic — not just "bigger." If you squint and the heading doesn't obviously dominate, the hierarchy is flat.

**What separates good from mediocre:**
- The ratio between heading and body matters more than the absolute sizes. A 36/16 split (2.25x) creates clear hierarchy. A 24/16 split (1.5x) is flat — you have to read to know which is the heading.
- Subheadings should be closer in weight to body than to headings. They organize, they don't compete with the main heading.
- Line height is tighter on headings (1.1–1.2) and looser on body (1.5–1.6). When both are 1.5, headings float instead of anchoring.
- Body text between 45–75 characters per line. Wider than 75 and the eye loses its place on the return sweep. This is the single most ignored readability rule.
- Weight contrast does more than size contrast at small scales. A bold 14px label reads as more important than a regular 16px label.

**The test:** Cover the content and just look at the shapes. Can you tell what's a heading, what's a subheading, what's body, and what's a label — purely from size, weight, and spacing? If not, the type hierarchy is communicating nothing.

---

## Color: When It's Working

Color works when it **means something.** A palette is good when removing any one color would break the communication — every hue has a job.

**What separates good from mediocre:**
- One dominant color, used sparingly. The less you use it, the more it means. If your brand blue is everywhere, nothing is blue.
- Neutrals do the heavy lifting. 80%+ of the interface should be neutral tones. Color appears at decision points, status indicators, and the primary action.
- Tinted neutrals are the easiest way to make a palette feel cohesive. Pure gray (#808080) has no personality. Gray pulled 5% toward your brand hue suddenly feels intentional.
- Dark backgrounds are not inherently better or worse. They're right when the content is visual (media, data viz, creative tools) and wrong when the content is text-heavy (docs, forms, articles). Reading long-form text on dark backgrounds causes eye strain.
- The accent color should appear in exactly one place per viewport — the thing you want the user to do. Two accent-colored elements on the same screen compete. Three and you've lost.

**The test:** Desaturate the page to grayscale. Does the hierarchy still work? If yes, color is enhancing an already-working design. If the hierarchy collapses without color, the design is using color as a crutch for missing structural hierarchy.

---

## Spacing: When It's Working

Spacing is the most underrated design tool. The difference between "looks professional" and "looks like a template" is almost entirely spacing.

**What separates good from mediocre:**
- **Proximity is information.** Tight spacing between elements says "these belong together." Wide spacing says "new thought." When everything has the same gap, you're saying nothing.
- The space BETWEEN sections should be noticeably larger than the space WITHIN sections. If section gaps and element gaps are similar, the page reads as one continuous stream instead of organized chunks.
- Content at the top of the page gets more room to breathe. Content deeper in the page can be denser. This mirrors how attention works — generous up top earns trust and signals quality, density below rewards the user who scrolled.
- Asymmetric margins feel more designed than centered layouts. A left-aligned content block with generous right margin creates visual tension and directs the eye. Centered layouts are the default, which is why they feel default.
- Padding inside a component should be proportional to the component's importance. A primary CTA with 12px padding feels cheap. The same button with 16px vertical / 32px horizontal feels intentional.

**The test:** Blur your eyes and look at the page as blocks of density. Can you see the groupings? Can you tell where sections start and end without reading? If the density is uniform, the spacing is doing nothing.

---

## Layout: When It's Working

Good layout creates a visual path. The eye enters the page somewhere, moves through the content in the intended order, and arrives at the action. Bad layout makes the eye bounce.

**What separates good from mediocre:**
- The entry point should be obvious. One element is largest, highest-contrast, or most isolated. If nothing claims dominance, the user starts wherever their eye happens to land — which means you've lost control of the narrative.
- Grids are tools, not goals. A strict 3-column grid with equal-sized elements is a spreadsheet. Vary column widths, span elements across columns, break the grid for emphasis. The grid should be felt, not seen.
- Whitespace around an element amplifies its importance. An element surrounded by space reads as more important than a larger element crowded by neighbors. This is counterintuitive and the model consistently gets it wrong — it defaults to making important things bigger rather than giving them room.
- Scroll depth should reward. Each viewport should have a complete thought — not cut off mid-section. The bottom of the visible area should hint at what's next, pulling the user down. A hard cut at the fold with no visible continuation kills scroll momentum.

---

## Motion: When It's Working

Motion communicates change. Entrance, exit, state shift, feedback. If an animation isn't communicating one of those things, it's decoration.

**What separates good from mediocre:**
- **Duration scales with distance.** A tooltip appearing in place: 100–150ms. A panel sliding in from the side: 250–350ms. A full page transition: 400–500ms. Too fast feels glitchy. Too slow feels sluggish. Most AI-generated animations are too slow.
- **Ease-out for entrances** (element arriving, decelerating into place). **Ease-in for exits** (element accelerating away). Ease-in-out for things that move position without entering or leaving. Linear for nothing — it feels mechanical.
- **Stagger, don't synchronize.** A list of items fading in simultaneously is a flash. The same items staggered by 50ms each feels like a wave — intentional, rhythmic. Stagger delay should be short (30–80ms per item). Too long and it feels like lag.
- **Only animate transform and opacity.** Animating width, height, margin, or padding triggers layout recalculation — it's expensive and looks choppy. translateX/Y for position, scale for size, opacity for presence.
- The absence of motion is a valid choice. A fast, snappy interface that jumps between states instantly can feel more professional than one with animations on everything. Motion should be earned, not default.

---

## Interaction: When It's Working

An interface that responds to you feels alive. One that doesn't feels broken — even if it technically works.

**What separates good from mediocre:**
- **Hover states are not optional** on desktop. Every clickable element needs a visible hover change. Not just cursor: pointer — a visual shift (background, underline, color, subtle lift). Without hover states, the user is guessing what's interactive.
- **Focus states matter for everyone**, not just accessibility. Tab through your interface. If you can't tell where you are, it's broken. `:focus-visible` (not `:focus`) prevents focus rings on mouse clicks while keeping them for keyboard nav.
- **Loading states should be designed, not defaulted.** A spinner says "wait." A skeleton screen says "content is coming and it'll look like this." Skeletons reduce perceived load time because the layout is already established when content fills in.
- **Error states are a trust moment.** A red border with "Invalid input" is hostile. A specific message near the field ("Email needs an @ symbol") with the field highlighted — not the whole form reset — is helpful. The difference is enormous for trust.
- **The primary action should be the only visually loud button on screen.** Secondary actions get ghost buttons, text links, or muted styles. When everything is a primary button, nothing is.

---

## Identity: When It's Working

This is the hardest one and the one the model is worst at. Identity is what makes an interface THIS product instead of ANY product.

**What separates good from mediocre:**
- Identity lives in the small decisions. The specific border radius (not the default). The specific shade of gray (not pure gray). The specific easing curve. The micro-interaction on the primary button. These tiny choices, when consistent, create a feeling that "someone designed this."
- A product's interface should be recognizable with the logo covered. If you can swap in a competitor's logo and nothing feels wrong, the design has no identity.
- Identity comes from constraints, not additions. Choosing to ONLY use one font weight. Choosing to NEVER use drop shadows. Choosing a spacing scale and using nothing outside it. These constraints force distinctiveness.
- The most memorable interfaces have one or two signature details — a specific transition, an unexpected color in the palette, a distinctive way of handling cards or navigation. You don't need to be weird everywhere. One strong opinion, applied consistently, is enough.

**The test:** Describe this interface to someone who can't see it, without mentioning the content. If all you can say is "clean, modern, minimal" — it has no identity. Those words describe everything and therefore nothing.
