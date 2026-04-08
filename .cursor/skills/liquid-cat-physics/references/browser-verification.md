# Browser Verification Protocol

For visual, UI, and frontend work where "tests pass" is insufficient. This protocol turns subjective visual assessment into structured, checkable verification.

---

## When to Use

The THINK phase should specify browser verification when the action involves:
- UI component creation or modification
- CSS/layout changes
- Canvas/WebGL/SVG rendering
- Any visual output the user will see
- Frontend behavior (interactions, animations, transitions)

Browser verification is a **valid GREEN verification method** — equivalent to test suites for logic work. Without it, all visual work gates YELLOW ("no automated verification").

---

## Verification Steps

### 1. Ensure the dev server is running

Check if the project has a dev server. Common patterns:
- `npm run dev` / `npx vite` / `next dev`
- `python3 -m http.server <port>` (static files)
- Check `package.json` scripts, CLAUDE.md, or Working Memory for the command and port

If no dev server is running, start one. Record the command and port in Working Memory so future iterations don't rediscover it.

### 2. Navigate and screenshot BEFORE changes (if modifying existing UI)

Before making code changes:
1. Open the relevant page/route in the browser
2. Take a screenshot: save to `_working_memory/screenshots/iter-N-before.png`
3. Note the current visual state

Skip this for new pages/components that don't exist yet.

### 3. Make the code changes

Normal ACT phase execution.

### 4. Navigate and screenshot AFTER changes

1. Reload or navigate to the affected page
2. Take a screenshot: save to `_working_memory/screenshots/iter-N-after.png`

### 5. Structured assessment

Do NOT ask "does this look good?" — that's subjective and unreliable. Instead, run through this checklist:

**Functional checks (objective — must all pass):**
- [ ] Page loads without console errors (read console messages)
- [ ] No JavaScript exceptions in console
- [ ] Key elements are present and visible (check by selector or visual confirmation)
- [ ] Interactive elements respond to clicks/input (if applicable)
- [ ] No broken images or missing assets

**Layout checks (objective — must all pass):**
- [ ] Elements are positioned where intended (not overlapping, not off-screen)
- [ ] Text is readable (not clipped, not overflowing containers)
- [ ] Responsive: check at desktop width (1280px) minimum. Check mobile (375px) if the project requires it.
- [ ] No unexpected scrollbars or overflow

**Design system checks (if project has one — check Working Memory / CLAUDE.md):**
- [ ] Colors match design tokens
- [ ] Typography matches specified fonts/sizes
- [ ] Spacing follows the grid/scale

**Behavioral checks (if the change involves interaction):**
- [ ] Click handlers fire correctly
- [ ] Form inputs accept and display values
- [ ] Animations/transitions play (if applicable)
- [ ] State changes reflect in the UI

### 6. Record results

In the verification field of Last Action:
```
**Verification:** Browser check — [URL]. Console: clean / N errors. Layout: correct / [issue]. Design system: matches / [deviation]. Screenshot: _working_memory/screenshots/iter-N-after.png
```

---

## Failure Handling

- **Console errors:** Record the error. If it's caused by your change, fix it before committing. If pre-existing, note it but don't fix (check verification_baseline).
- **Layout broken:** This is a failed verification. Record in failure log. Do NOT commit broken UI.
- **Design system mismatch:** If the project has defined tokens/conventions and your change doesn't follow them, fix it. If no design system exists, this check is N/A.
- **Can't visually assess:** If the change is too subtle or complex for structured checking (e.g., "does this animation feel smooth?"), mark it YELLOW in the verification. Note what you can't verify. The human reviews at checkpoint.

---

## Screenshot Storage

```
_working_memory/
└── screenshots/
    ├── baseline.png          (from Phase 0, if UI existed)
    ├── iter-3-after.png
    ├── iter-7-before.png
    ├── iter-7-after.png
    └── ...
```

Keep screenshots for the current checkpoint cycle. At each human checkpoint, the screenshots provide a visual history of changes. The human can review the progression.

Prune screenshots older than 2 checkpoint cycles to avoid bloat.

---

## Tools Available

Use whichever browser automation tools are available in the session:
- **Playwright** (`mcp__playwright__*`): `browser_navigate`, `browser_take_screenshot`, `browser_snapshot`, `browser_console_messages`, `browser_click`, `browser_evaluate`
- **Claude in Chrome** (`mcp__claude-in-chrome__*`): `navigate`, `read_page`, `read_console_messages`, `javascript_tool`, `computer`

Prefer Playwright for automated verification (headless, reliable). Use Chrome tools if Playwright isn't available or for interactive debugging.

---

## Quick Decision Guide

```
Is this change visual/UI?
├── NO → Use standard verification (tests, build, lint)
└── YES → Browser verification required
    ├── Dev server running? (check Working Memory)
    │   ├── YES → Navigate, screenshot, assess
    │   └── NO → Start it, record in Working Memory, then proceed
    ├── Modifying existing UI?
    │   ├── YES → Screenshot BEFORE and AFTER
    │   └── NO → Screenshot AFTER only
    └── Run structured checklist. All functional + layout checks must pass.
```
