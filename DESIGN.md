---
name: DocuMind
description: Ask. Get Answers. With Sources.
colors:
  cover: "#14254A"
  cover-2: "#22365F"
  cover-3: "#2E4573"
  cover-ink: "#C9D3E6"
  sheet: "#FFFFFF"
  ink: "#14254A"
  slate: "#4C5873"
  rule: "#DFE4EE"
  paper: "#EEF1F6"
  tab: "#F5821F"
  tab-hover: "#FF9A3D"
  tab-ink: "#A84F06"
  tab-soft: "#FDEBDB"
  danger: "#B42318"
typography:
  display:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 3.6vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  stat:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.1rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.11
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  body-lead:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.25
  chip:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "1.35rem"
    fontFeature: "\"tnum\""
rounded:
  chip: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  bubble: "16px"
  hole: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "10": "40px"
  "16": "64px"
  margin-holes: "48px"
components:
  button-primary:
    backgroundColor: "{colors.tab}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.tab-hover}"
    textColor: "{colors.ink}"
  button-outline:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-outline-hover:
    backgroundColor: "{colors.paper}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  input-ask:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  input-field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  citation-chip:
    backgroundColor: "{colors.tab}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.chip}"
    padding: "0 4px"
  index-tab:
    backgroundColor: "{colors.cover-2}"
    textColor: "{colors.cover-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    width: "9.5rem"
  index-tab-hover:
    backgroundColor: "{colors.cover-3}"
    textColor: "{colors.sheet}"
    width: "10rem"
  index-tab-cited:
    backgroundColor: "{colors.tab}"
    textColor: "{colors.ink}"
    width: "calc(9.5rem + var(--reach))"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "56px 56px 56px 80px"
  passage-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  admin-tab:
    backgroundColor: "{colors.cover-2}"
    textColor: "{colors.cover-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px 12px"
  admin-tab-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  section-edge-tab:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px 10px 12px"
  lead-form:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px"
---

# Design System: DocuMind

## Overview

**Creative North Star: "The Policy Binder"**

DocuMind is the company's own policy binder, opened at the page that answers you. The navy board cover is the ground; white punched sheets are the only working surfaces; one flat index tab per document hangs off the sheet's edge. When an answer cites a document, that tab slides further out and turns brand orange, and pressing it opens the exact passage used. Every visual decision serves that one claim: the answer came from a page you can check.

The system is flat and physical without imitating paper texture. Depth is told by layering (cover, then sheet, then tab overhanging the sheet) and by color steps within the navy family, never by shadow. The marketing page speaks loudly (an 800-weight tagline at monumental size on the cover); the widget and admin use the same materials at an Operate register: denser, smaller type, the same tabs and sheets.

Orange is scarce and meaningful. It marks what was cited, what is active, and the one primary action. Everything else is navy, white and cool grey.

**Key Characteristics:**
- Navy board cover as page ground; white punched sheet as the working surface.
- Index tabs, one per document, whose reach encodes match strength.
- Orange only for cited, active and primary; always carrying navy text.
- Poppins throughout, 800 down to 400.
- Flat: no shadows, bevels or gradients.

## Colors

A two-family palette: the brand navy as ground and ink, the brand orange as the binder's index color, with a cool grey ramp for sheet furniture.

### Primary
- **Binder Board Navy** (cover): the page ground on the home page, login and the admin header; also the color of the punch holes, which are simply the cover showing through the sheet. Same value as ink.
- **Raised Board** (cover-2): idle index tabs and idle admin divider tabs; inset panels on the cover.
- **Lifted Board** (cover-3): hover state for tabs on the cover, the hairline rules on the cover (stat divider, footer border), and the scrollbar thumb.
- **Board Ink** (cover-ink): secondary text and nav links on the cover; idle tab labels.

### Secondary
- **Index Tab Orange** (tab): the brand orange. Cited index tabs, citation number chips, primary buttons, the second line of the tagline on the cover, the focus outline, the streaming caret and text selection.
- **Pressed Tab Orange** (tab-hover): hover fill for orange buttons only. Currently written as a literal in four places, not a CSS variable.
- **Tab Ink** (tab-ink): orange when it has to be text or a line on white: step numerals in "How it works", the "Open the document" link in the passage panel, the focused Ask input border and the text caret.
- **Tab Wash** (tab-soft): the orange tint reserved for success notes and lead highlights. Defined as a token (and as the legacy alias highlight-soft); no shipped surface uses it yet.

### Neutral
- **Sheet White** (sheet): every punched sheet, the chat surface, form fields, the logo's label plate and the section edge tabs.
- **Ink** (ink): all body text on the sheet, user message bubbles, the stroke of the Ask input and outline buttons, step-rule tops.
- **Slate** (slate): secondary text on the sheet: subtitles, captions, table cells, placeholders.
- **Sheet Rule** (rule): hairlines on the sheet, input borders, table borders, the chat header's 2px underline.
- **Paper** (paper): admin page ground, the active admin divider tab, quiet fills (passage panel, table heads, the "Leads, too" note, outline-button hover).
- **Danger** (danger): error copy, failed-result marks and destructive hover in the admin. Text only; never a fill.

### Named Rules
**The Navy-On-Orange Rule.** An orange fill always carries navy (ink) text, never white. When orange must itself be text or a stroke on white, use Tab Ink (#A84F06), never the brand orange. The one exception is display-size orange type on the navy cover (the tagline's "With Sources."), where the brand orange reads at large size.

**The Earned Orange Rule.** Orange means cited, active or primary. A tab is orange only because the latest answer cited its document; a button is orange only because it is the single primary action in its region. Decorative orange is a bug.

**The Ground Shows Through Rule.** Punch holes and anything "cut out" of a sheet are filled with the cover navy, not a grey or a shadow.

## Typography

**Display Font:** Poppins (with ui-sans-serif, system-ui, sans-serif), loaded via next/font as `--font-poppins`, weights 400, 500, 600, 700, 800.
**Body Font:** Poppins, same stack.

**Character:** One geometric family carries both the shout and the small print. Weight does the work that a second family would: 800 for the tagline, 700 for headlines and stats, 600 for labels on orange, 500 for tab and UI labels, 400 for reading text.

### Hierarchy
- **Display** (800, clamp(2.3rem, 3.6vw, 3.5rem), 1.04, -0.03em): the tagline lockup on the cover, in the logo's title case. Only once per page.
- **Stat** (700, 2.1rem, 1, -0.02em, tabular): the "20 of 20" result row on the cover. Chat header cited count uses 800 at 1.5rem.
- **Headline** (700, 1.875rem mobile to 2.25rem from 640px, -0.02em): section headings on each sheet.
- **Title** (700, 1.25rem): step and sub-section headings; the binder chat header is 700 at 1.125–1.25rem; the login heading 700 at 1.25rem.
- **Body lead** (400, 17px, 1.625): the paragraph under the tagline on the cover, max 44ch.
- **Body** (400, 15px, 1.7 in answers, 1.625 elsewhere): chat answers (max 62ch), section prose (max 60–68ch), step descriptions; 16px for the sheet intro under each headline.
- **Label** (500, 13px, tight leading): index tab labels, starter prompts heading, chat subtitle, table heads. The cited tab adds a 700 13px tabular "Page n" line.
- **Chip** (600, 11px, tabular): citation numbers inside the orange chip.

### Named Rules
**The One Family Rule.** Poppins only. Hierarchy comes from weight and size, never from a second display face or from uppercase tracking.

**The Tabular Count Rule.** Every number that is compared or counted (stats, citation numbers, page numbers, table cells, step numerals) uses tabular figures.

## Layout

The home page is a 7xl (80rem) column with 16px gutters on phones, 32px from 640px and 40px from 1024px. The first viewport is a two-column grid at 4fr / 7fr with a 48px gap: copy and stats on the left, the live binder sheet on the right at min(82dvh, 760px) high (never under 520px), with an 11rem right margin reserved for the overhanging tab column. Below it, full-width sheets stack with 40px between them, each padded 40px vertically (56px from 1024px), 80px on the hole side and 56px on the other.

The spacing rhythm is Tailwind's 4px step, used mostly at 4, 8, 12, 16, 20, 24, 40 and 64px. The punched margin is a fixed 48px column (`3rem`) holding three 22px holes spread top to bottom; chat content is inset 64px on that side to clear it.

On phones the sheet comes first, the copy follows; the tab column becomes a horizontal strip of divider tabs on the sheet's top edge that scrolls sideways and auto-scrolls the first cited tab into view. Punch holes are hidden below 640px. Section edge tabs appear only from 1024px.

The admin uses a 6xl (72rem) column on a paper ground under a navy header whose divider tabs sit on its bottom edge. The widget is the compact chat at full viewport height on a white ground.

## Elevation & Depth

The system is flat. There are no box-shadows, bevels or gradients anywhere in the build. Depth is told in two ways: stacking order (tabs sit behind the sheet and overhang its edge; the sheet sits on the cover) and tonal steps within the navy family (cover, cover-2 for raised, cover-3 for hover). On the sheet, depth is a quiet paper fill or a 1px rule, nothing more.

### Named Rules
**The Flat Binder Rule.** No shadow, bevel, inner glow or gradient on any element. If something needs to read as "in front", give it a different flat tone or put it on the sheet.

## Shapes

Small, honest radii. Sheets use 6px corners; buttons, inputs, tabs, panels and tables 8px; the compact widget sheet and admin cards 12px; citation chips 4px. User message bubbles are the one soft shape at 16px with a 2px tail corner on the speaker's side. Punch holes are perfect circles.

Tabs are rounded only on their free edge: on desktop the right corners (the left edge tucks 8px under the sheet), on phones and in the admin header the top corners. When the binder chat has a tab column the sheet squares its right corners so the tabs meet a straight edge.

Borders are 1px rule hairlines by default; 2px ink for the Ask input, outline buttons and the top of each step; 2px rule under the chat header.

## Components

### Buttons
Plain, filled and certain.
- **Shape:** gently rounded (8px).
- **Primary (Ask, Open the widget demo, Sign in, Upload):** orange fill, navy text, 600 weight, 15px, 12px by 20px. One per region.
- **Hover / Focus:** fill steps to Pressed Tab Orange with a color transition; focus is a 2px orange outline offset 2px (global). Busy is 60% opacity; a disabled sign-in turns rule-grey with slate text.
- **Outline (Open the admin):** 2px ink border, ink text, transparent; hover fills paper.
- **Ink (lead form "Contact me"):** navy fill, white text, 6px corners, 500 weight; the secondary filled action inside a sheet when an orange primary already exists nearby.
- **Quiet icon buttons (close passage, close widget):** 28–36px square, slate glyph, hover fills rule or paper.

### Citation Chip
The orange tab, in miniature, inside a sentence.
- **Style:** orange fill, navy 11px 600 tabular number, 4px corners, min 1.35rem wide, sitting a hair above the baseline.
- **State:** hover draws a 2px ink outline; click opens the passage panel for that source. In the compact widget, sources also list below the answer as joined chips: an orange number block fused to a white label block with a 1px rule border that turns ink on hover.

### Punched Sheet
The working surface everything sits on.
- **Corner Style:** 6px (12px for the compact widget sheet).
- **Background:** sheet white on the navy cover.
- **Shadow Strategy:** none (see Elevation).
- **Holes:** a 48px column on the left edge holding three (two on the login card) 22px circles of cover navy, spread top to bottom with padding clamp(2.5rem, 14%, 7rem). Hidden below 640px.
- **Internal Padding:** 40–56px vertical; 64–80px on the hole side.

### Index Tabs (signature)
One flat tab per document, overhanging the sheet's right edge on desktop, a strip of divider tabs on phones.
- **Idle:** cover-2 fill, cover-ink 13px 500 label, 9.5rem wide (desktop), right corners 8px, tucked 8px under the sheet. On phones they sit 6px lower, half-hidden behind the sheet's top edge.
- **Hover:** cover-3 fill, white text; widens to 10rem on desktop, rises 4px on phones. Idle tabs ask that document's starter question when pressed.
- **Cited:** orange fill, navy text, a second 700 line reading "Page n"; fully raised on phones. Reach on desktop is 9.5rem plus a fixed similarity ramp: `8 + 22 * clamp((similarity - 0.3) / 0.45, 0, 1)` px, so 8px at 30% match up to 30px at 75% and above. Pressing a cited tab opens its passage; it reports `aria-pressed` while open.
- **Motion:** transform, width, background and color transition over 220ms on `cubic-bezier(0.16, 1, 0.3, 1)`; no transition under reduced motion.

### Passage Panel
- **Style:** paper fill, 1px rule border, 8px corners, 12px by 16px, docked between the conversation and the input, inset to clear the punched margin.
- **Content:** orange number chip plus "Title, p. n" in 600 14px; a slate "n% match" caption; the passage in 13.5px ink, scrolling at 9rem; a 600 Tab Ink underlined link to open the document at that page.

### Inputs / Fields
- **Ask input:** white, 2px ink border, 8px corners, 10px by 14px, 15px text (16px on phones to avoid zoom), slate placeholder. Focus turns the border Tab Ink; caret is Tab Ink.
- **Form fields (lead form, login, admin):** white, 1px rule border, 6px corners, 8px by 12px. Focus turns the border ink. Errors are danger-colored text below, never a red fill.

### Navigation
- **Cover nav:** 15px cover-ink links, hover white, top right beside the logo plate.
- **Logo plate:** Logo.png on a white 6px-rounded label plate, because the asset has an opaque white background.
- **Admin divider tabs:** tabs on the bottom edge of the navy header, top corners 8px, 14.5px 500. Idle cover-2 with cover-ink text, hover cover-3 with white; the active tab takes the paper fill so it merges into the paper page below, like a divider opened to its section. Color transition only.
- **Section edge tabs:** each content sheet on the home page carries a white label tab (12.5px 600 ink) hanging off its right edge 40px from the top, right corners 8px. Desktop (1024px+) only, decorative.

### Lead Form
- **Style:** inline in the conversation under the answer that triggered it; white, 1px ink border at 80% opacity, 8px corners, 12px padding, 14px text. A 500-weight offer line, name and email fields side by side from 640px, an ink "Contact me" button and a slate "No thanks" text button.
- **Saved:** collapses to a white 1px rule-bordered note thanking the visitor by first name.

### Status Motion
- **Streaming caret:** a 0.5ch orange block blinking on a 1s step.
- **Reading dots:** "Searching n documents" with three dots pulsing 0.35 to 1 opacity over 1.2s, staggered 150ms.
- Both stop under reduced motion.

## Do's and Don'ts

### Do:
- **Do** put every working surface on a white punched sheet over the navy cover (or the paper ground in the admin).
- **Do** give every document its own index tab, and let a citation pull that tab out by the similarity ramp (8px to 30px of reach).
- **Do** carry navy (#14254A) text on every orange fill, and switch to Tab Ink (#A84F06) whenever orange has to be text or a stroke on white.
- **Do** reserve orange for cited, active and primary: cited tabs, citation chips, the one primary button, the focus ring.
- **Do** animate tab reach with one 220ms ease-out slide (`cubic-bezier(0.16, 1, 0.3, 1)`) and remove it under `prefers-reduced-motion`.
- **Do** use Poppins for everything, with weight carrying the hierarchy, and tabular figures for every count.
- **Do** put the logo on a white label plate wherever it sits on navy.

### Don't:
- **Don't** add shadows, bevels, glows or gradients to anything; depth is cover, sheet and tab.
- **Don't** use orange decoratively, for idle tabs, for secondary buttons or as a background wash behind content.
- **Don't** put white text on orange, or the brand orange (#F5821F) as small text on white.
- **Don't** shade or texture the punch holes; they are flat circles of the cover color.
- **Don't** introduce a second typeface or uppercase-tracked labels.
