# Responsive manual design — provisional

White background, black typography, restrained technical styling and precise
diagrams inspired by a spiral-bound NATOPS manual. Convey structure and legibility;
do not reproduce copyrighted manual layouts or simulate wear at the expense of use.
This is a design proposal, not an implemented or usability-tested interface.

| Element | Direction to validate |
| --- | --- |
| Typography | Legible body text, clear heading hierarchy, tabular numerals for data |
| Layout | Subject navigation, readable text width, responsive tables and embedded figures |
| Colour | Mostly monochrome; sparse semantic accents supported by text or symbols |
| Diagrams | Labelled geometry, explicit units, consistent line weights and scale notes |
| Controls | Clear state, keyboard operation, visible focus and touch-friendly targets |
| Feedback | Explain why an answer succeeds/fails; never rely on colour alone |
| Sources | Nearby applicability, assumptions, maturity and source links |
| Motion | User control, reduced-motion alternative and no essential timed animation |

## Responsive layouts and component behaviour

Keep one semantic reading order at every size: page title and applicability,
in-page navigation, article sections, embedded experience, then related material
and sources. Do not duplicate content to make a separate mobile layout.

| Viewport (provisional) | Layout |
| --- | --- |
| Narrow, below 40rem | One column. Put subject navigation in a labelled, operable disclosure; keep the article and embedded experiences full-width. No page-level horizontal scrolling at 320 CSS pixels. |
| Medium, 40rem–63.99rem | Keep the article dominant. Show in-page navigation as a compact rail only when it leaves a readable article measure; otherwise use the disclosure. |
| Wide, 64rem and above | Use a bounded reading column with optional subject and in-page navigation rails. Keep the article near 68 characters per line and avoid filling wide screens with dense text. |

Use fluid outer gutters and a maximum content width. Tables retain their
caption, header associations and row relationships: use a clearly labelled
horizontal scroll region when necessary, or reformat as labelled records only
when that does not lose relationships. Never make the whole page overflow to fit
a table.

An embedded experience stays within the article flow and is not clipped to a
fixed height. Present its objective, applicability and limitations before its
controls and visualisation; put results and debrief after them. Start only on
user action. Keep controls, visualisation and feedback in one logical keyboard
order; provide pause/reset where motion or a running scenario is involved. A
reference explanation must remain useful if the interactive part is unavailable.

## Keyboard and diagram accessibility

- Use landmarks, one clear page heading, ordered section headings, a skip link,
  and native links and form controls. Navigation disclosures must expose their
  expanded state; do not trap focus or hide the only route to a section.
- Make every operation available without a pointer, keep focus visible and
  unobscured, and provide usable touch targets (provisionally at least 44 CSS
  pixels). Support text resizing and reflow without clipped controls or prose.
- Do not autoplay or make timing essential. Respect reduced-motion preferences;
  provide pause/stop controls for non-essential moving content. Announce
  important result changes without repeatedly interrupting assistive technology.
- Give each diagram a concise text alternative and, where meaning is complex, a
  nearby longer explanation. Label axes, direction, units, scale and
  applicability; distinguish series with labels or patterns as well as colour.
- Static diagrams do not need a tab stop. An interactive diagram must expose
  equivalent keyboard-operable controls and text results; dragging, hovering or
  colour alone cannot be the only way to understand or operate it.

These are design acceptance criteria for future UI work, not evidence that an
interface has passed an accessibility audit. Numerical geometry also needs
independent technical verification under the [content standards](content-standards.md).

## Provisional tokens

Values are starting points for implementation and contrast testing, not a
committed brand or final component API.

| Token | Provisional value | Use |
| --- | --- | --- |
| `color-page` | `#ffffff` | Main page background |
| `color-surface` | `#f5f6f7` | Quiet panels and table headers |
| `color-text` | `#171717` | Primary text |
| `color-muted` | `#595959` | Secondary text; do not use for essential information alone |
| `color-border` | `#767676` | Visible boundaries and separators |
| `color-link` | `#005a9c` | Underlined links |
| `color-focus` | `#005fcc` | High-visibility focus indicator |
| `space-1` … `space-8` | `0.25rem` … `2rem`, in `0.25rem` steps | Consistent spacing scale |
| `measure-reading` | `68ch` | Long-form text measure |
| `measure-page` | `72rem` | Maximum page content width |
| `breakpoint-medium` | `40rem` | Narrow-to-medium layout change |
| `breakpoint-wide` | `64rem` | Medium-to-wide layout change |
| `target-minimum` | `44px` | Provisional minimum interactive target |

Keep semantic state distinguishable by text and icon/shape as well as colour.
Use a system sans-serif stack for prose and tabular numerals for aligned values;
reserve monospace for literal code or identifiers. Test all text, focus and
non-text boundaries against their actual backgrounds when UI is implemented.

## Source and maturity presentation

Keep applicability and content maturity visible near the page title and repeat
the relevant status beside a claim or block when readers could otherwise miss
its scope. Use explicit text labels, not colour-only badges. Make source markers
keyboard-accessible links to a nearby source list containing title, publisher,
edition/date, precise section/page, lawful access and rights information.
Expose assumptions and unresolved limitations next to the affected claim.

Use the maturity values and gates in [content standards](content-standards.md):
Outlined, Researched, Drafted, Technically Validated and Published. For example,
show “Drafted — not technically validated” rather than an ambiguous “draft”
badge. A Technically Validated label requires independent source-backed SME agent
review and complete evidence for that revision; Published additionally requires the publication gates and
actual release. Do not imply that a visual treatment itself validates or
approves content.

## Review record

Checked against the [product vision](vision.md), [content standards](content-standards.md),
[content/experience contract](content-contracts.md) and
[working architecture](architecture.md). Findings:

- The existing direction establishes a restrained, readable reference but does
  not define responsive breakpoints or navigation behavior; the article-first
  layouts above fill that gap provisionally.
- Reference pages and embedded experiences share a content flow, so the
  experience needs an explicit objective-to-controls-to-debrief order and must
  not be required to access the reference explanation.
- Content standards require visible applicability, traceable sources and
  revision-specific maturity; text labels and nearby source details are needed
  so neither colour nor a generic badge implies validation.
- The standards also require precise, labelled diagrams. Static figures need a
  text equivalent; interactive figures additionally need a keyboard alternative.

No application exists to inspect, so no rendered mobile/tablet/desktop layouts,
browser/keyboard checks or user testing were performed.

**Recommendation:** use this direction as a provisional baseline for later
implementation. **Owner approval:** pending; no approval is claimed.
**Independent review:** not recorded; a fresh independent reviewer was not
available in this task session. Owner review and independent review remain open
before treating the proposal as approved.

Future visual acceptance: inspect narrow mobile, tablet and desktop; check zoom,
long labels, table overflow, keyboard/focus order, touch controls, reduced motion
and error/empty states. Record screenshots and findings tied to the implementation
revision. Numerical diagrams must be checked for correct geometry as well as
appearance.
