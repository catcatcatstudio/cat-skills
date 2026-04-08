# Persona Pressure Test

Test the interface through specific user archetypes. Each one exposes different failure modes. Select 2-3 most relevant to the interface type, walk through the primary action, report specific failures.

---

## Alex — Impatient Power User

Expert with similar products. Expects efficiency, hates hand-holding. Will find shortcuts or leave.

**Behaviors:** Skips onboarding. Looks for keyboard shortcuts. Tries bulk actions. Gets frustrated by unnecessary steps. Abandons if anything feels slow or patronizing.

**Red flags to check:**
- Forced tutorials or unskippable onboarding
- No keyboard navigation for primary actions
- Slow animations that can't be skipped
- One-item-at-a-time workflows where batch would be natural
- Redundant confirmation for low-risk actions

---

## Jordan — Confused First-Timer

Never used this type of product. Needs guidance at every step. Will abandon rather than figure it out.

**Behaviors:** Reads all instructions. Hesitates before clicking anything unfamiliar. Looks for help constantly. Misunderstands jargon. Takes the most literal interpretation of any label.

**Red flags to check:**
- Icon-only navigation with no labels
- Technical jargon without explanation
- No visible help option or guidance
- Ambiguous next steps after completing an action
- No confirmation that an action succeeded

---

## Sam — Accessibility-Dependent User

Uses screen reader, keyboard-only navigation. May have low vision, motor impairment, or cognitive differences.

**Behaviors:** Tabs through linearly. Relies on ARIA labels and heading structure. Cannot see hover states. Needs adequate contrast (4.5:1 minimum). May use 200% zoom.

**Red flags to check:**
- Click-only interactions with no keyboard alternative
- Missing or invisible focus indicators
- Meaning conveyed by color alone
- Unlabeled form fields or buttons
- Custom components that break screen reader flow

---

## Riley — Deliberate Stress Tester

Methodical user who pushes beyond the happy path. Tests edge cases, tries unexpected inputs, probes for gaps.

**Behaviors:** Tests empty states, long strings, special characters. Submits unexpected data. Navigates backwards, refreshes mid-flow, opens multiple tabs. Documents problems.

**Red flags to check:**
- Features that appear to work but silently fail
- Error handling that exposes technical details or breaks UI state
- Empty states that show nothing useful
- Workflows that lose data on refresh or navigation
- Inconsistent behavior between similar interactions

---

## Casey — Distracted Mobile User

Using phone one-handed on the go. Frequently interrupted. Possibly on slow connection.

**Behaviors:** Thumb-only. Gets interrupted mid-flow. Switches between apps. Low patience. Types as little as possible.

**Red flags to check:**
- Important actions at top of screen (unreachable by thumb)
- No state persistence on tab switch or interruption
- Large text inputs required where selection would work
- Heavy assets on every page (no lazy loading)
- Tiny tap targets or targets too close together

---

## Selection Guide

| Interface Type | Use These Personas | Why |
|---------------|-------------------|-----|
| Landing page / marketing | Jordan, Riley, Casey | First impressions, trust, mobile |
| Dashboard / admin | Alex, Sam | Power users, accessibility |
| E-commerce / checkout | Casey, Riley, Jordan | Mobile, edge cases, clarity |
| Onboarding flow | Jordan, Casey | Confusion, interruption |
| Data-heavy / analytics | Alex, Sam | Efficiency, keyboard nav |
| Form-heavy / wizard | Jordan, Sam, Casey | Clarity, accessibility, mobile |
| Creative / portfolio | Jordan, Casey | First impressions, mobile |
| Developer tools | Alex, Riley | Power use, edge cases |
