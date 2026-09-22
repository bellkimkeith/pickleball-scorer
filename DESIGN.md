---
name: Pickleball Scorer
description: A top-down court and a paddle rack, drawn the way players already see the game.
colors:
  court-outer: "#2d5a48"
  court-outer-deep: "#1f4134"
  court-surface: "#23473a"
  court-inner: "#2c5c93"
  court-kitchen: "#3a6aa3"
  court-line: "#f4f6f2"
  court-line-text: "#1d3d31"
  ink: "#f4f6f2"
  ink-muted: "#b9cfc5"
  deep: "#10231c"
  danger: "#ffb4a6"
  ball: "#e9e24a"
  clock-well: "#0f2a4a"
  clock-ink: "#dce8f5"
  paddle-guard: "#17181a"
  paddle-grip: "#191919"
  paddle-grip-text: "#ffffff"
  pair-tape: "#e9d8a6"
  face-ochre: "#e3a33b"
  face-coral: "#e0634a"
  face-paper: "#f2efe8"
  face-sky: "#8fc3e6"
  face-carbon: "#2f3130"
  face-lilac: "#8a93bd"
  face-sand: "#cbb389"
  face-teal: "#3f9e91"
  face-ochre-text: "#2b1d05"
  face-coral-text: "#2a0c05"
  face-paper-text: "#1d2a24"
  face-sky-text: "#0d2638"
  face-carbon-text: "#f1f1ef"
  face-lilac-text: "#150e26"
  face-sand-text: "#241c0d"
  face-teal-text: "#04201a"
typography:
  score-call:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "92px"
    fontWeight: 800
    lineHeight: "96px"
    letterSpacing: "-3px"
    fontVariant: "tabular-nums"
  screen-title:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "38px"
    letterSpacing: "normal"
  modal-title:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: "28px"
    letterSpacing: "normal"
  section-title:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "normal"
  row-label:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "17px"
    fontWeight: 500
    letterSpacing: "normal"
  button-label:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "normal"
  body:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "21px"
    letterSpacing: "normal"
  label:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.4px"
  signage:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "11px"
    fontWeight: 800
    letterSpacing: "0.6px"
rounded:
  court: "4px"
  icon-court: "2px"
  control: "10px"
  button: "12px"
  group: "14px"
  tile: "16px"
  modal: "22px"
  pill: "999px"
spacing:
  hair: "2px"
  xs: "4px"
  sm: "8px"
  card: "10px"
  gutter-court: "12px"
  row: "14px"
  gutter-text: "16px"
  lg: "18px"
  xl: "22px"
  block: "24px"
  court-stack: "20px"
  safe-bottom: "30px"
components:
  button-line:
    backgroundColor: "{colors.court-line}"
    textColor: "{colors.court-line-text}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "0 16px"
    height: "50px"
  button-deep:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "0 16px"
    height: "52px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "0 16px"
    height: "48px"
  button-danger-text:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "0 16px"
    height: "50px"
  list-group:
    backgroundColor: "rgba(244, 246, 242, 0.06)"
    textColor: "{colors.ink}"
    rounded: "{rounded.group}"
  list-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.row-label}"
    padding: "8px 14px"
    height: "52px"
  segmented-selected:
    backgroundColor: "{colors.court-line}"
    textColor: "{colors.court-line-text}"
    rounded: "8px"
    height: "38px"
  segmented-unselected:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "8px"
    height: "38px"
  sheet:
    backgroundColor: "{colors.court-surface}"
    textColor: "{colors.ink}"
    rounded: "22px 22px 0 0"
    padding: "10px 16px 30px"
  dialog:
    backgroundColor: "{colors.court-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.modal-title}"
    rounded: "{rounded.modal}"
    padding: "22px"
  court-diagram:
    backgroundColor: "{colors.court-inner}"
    textColor: "{colors.ink}"
    rounded: "{rounded.court}"
  toolbar:
    backgroundColor: "{colors.court-outer-deep}"
    textColor: "{colors.ink}"
    padding: "12px 0 24px"
  tile-mode:
    backgroundColor: "rgba(244, 246, 242, 0.06)"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "14px"
    height: "128px"
---

# Design System: Pickleball Scorer

## Overview

**Creative North Star: "Courtside, Looking Down"**

The whole app is the thing it is about. The screen ground is outer-court green with the faint grit of sand aggregate rolled into acrylic paint; a match is a real top-down court at real proportions with each name standing in its playing position; the waiting queue is the paddle rack every open-play group already leans against the fence. Nothing is a metaphor for the game — it is a drawing of the game, at a glance, in sun or under court lights. The category default this replaced was white cards, a green button and a plain list of names.

Density is courtside-legible, not dashboard-dense. One screen carries a 34pt title, a small meta line, one court diagram per court, a full-width white action, and the rack. Scores get to be enormous (92–104pt, tabular) because the organiser reads them from arm's length between rallies. Everything else is quiet: text is line-white or a desaturated mint-grey on green, containers are the ground tinted a few percent lighter rather than a new material.

Colour is rationed hard. Green is the world, blue is the court, line-white is the only bright fill, and saturation is reserved almost entirely for the eight paddle faces — one per player, so a person can find themselves on court, in the rack and in the summary without reading. The build carries no shadows at all and no display typeface; depth comes from tonal layering and the type does its work through size and weight alone.

**Key Characteristics:**
- One appearance only: no light/dark switch, same world in either system setting
- Real court geometry (44:20, 7ft kitchen) rather than a rounded box
- Line-white (#f4f6f2) as the single bright fill, on court lines and primary buttons alike
- Eight paddle faces as the only saturated colour, one per player, all test-enforced to 4.5:1
- Completely flat: zero shadow declarations in the shipped code
- System type only; huge tabular numerals for scores

## Colors

A green-and-blue court palette with a single bright white, held together by alpha-over-green tinting rather than a second material.

### Primary
- **Line White** (`{colors.court-line}`): The 2-inch court line. It draws every line, net and service boundary; it fills the primary button; it fills the selected segment, the "on" toggle track, the court-number pill and the NEXT UP tab. It is the only bright surface in the world, which is why it always reads as the action.
- **Court Line Text** (`{colors.court-line-text}`): Deep court green, used for text and icons sitting on a line-white fill. The pairing is contrast-tested.

### Secondary
- **Court Blue** (`{colors.court-inner}`): The playing surface inside the lines. Every court drawing, from the full diagram to the 46x32pt mini-court used as a mode icon.
- **Kitchen Blue** (`{colors.court-kitchen}`): The non-volley zone, one step lighter, 7ft either side of the net. It is the only reason a court drawing reads as a pickleball court and not a tennis court.
- **Clock Well / Clock Ink** (`{colors.clock-well}` / `{colors.clock-ink}`): A dark blue chip on the net carrying the elapsed-match clock in tabular numerals, and the same pale blue for the active-session line on home.

### Tertiary
- **Paddle Faces** (`{colors.face-ochre}`, `{colors.face-coral}`, `{colors.face-paper}`, `{colors.face-sky}`, `{colors.face-carbon}`, `{colors.face-lilac}`, `{colors.face-sand}`, `{colors.face-teal}`): Player identity, and nothing else. Eight because spec §4.6 gives every player their own face and five collide once a session passes eight players. Each face has a paired text colour (`face-*-text`) clearing 4.5:1, enforced by `lib/theme/__tests__/tokens.test.ts`. Faces also appear as 7–10pt dots beside names on court and in mini-courts.
- **Ball Yellow** (`{colors.ball}`): The serving marker, and the doubles server number. Nothing else — a test asserts no paddle face is ever this colour.
- **Danger Coral** (`{colors.danger}`): Text-only destructive labels (End session, Remove player). It never becomes a fill.

### Neutral
- **Outer Court Green** (`{colors.court-outer}`): The screen ground, applied once at the root behind the grit texture. Every screen and every navigator `contentStyle` is transparent over it.
- **Deep Court Green** (`{colors.court-outer-deep}`): The paddle rack and the scorer toolbar — structures that sit *on* the ground.
- **Court Surface Green** (`{colors.court-surface}`): Sheets and dialogs, the one surface allowed to float above the ground.
- **Deep** (`{colors.deep}`): Near-black green, the secondary button fill.
- **Ink** (`{colors.ink}`): Primary text and icons, identical to line-white.
- **Ink Muted** (`{colors.ink-muted}`): Desaturated mint for meta lines, row values, captions and disabled reasons. Tested to 4.5:1 on the green ground, so it is a legibility-safe secondary rather than a decorative grey.
- **Paddle Guard / Grip / Grip Text** (`{colors.paddle-guard}`, `{colors.paddle-grip}`, `{colors.paddle-grip-text}`): The rubber edge guard, the grip wrap, and the games-played number on the wrap.
- **Pair Tape** (`{colors.pair-tape}`): Masking-tape tan, drawn at -6° across two paddles that are locked as a pair.

### Named Rules
**The One Appearance Rule.** There is no light mode and no dark mode. The court world is identical in either system setting, the status bar is always light, and there is no colour-scheme hook anywhere in the source. Any future surface that branches on appearance is wrong.

**The Line-White Rule.** `court-line` is the only bright fill in the system. If a new surface needs emphasis, it gets line-white or it gets nothing; do not introduce a second accent fill.

**The Ball Rule.** `ball` marks the serve and the server number. It is never a background, a border, a highlight or a paddle face — and a unit test enforces the last of those.

**The Own Face Rule.** A player keeps one paddle colour for the whole session, in the rack, on court, and in the summary. Paddle colour is identity, never status; status is carried by outline, ghost and tape instead.

**The Tint-Not-Material Rule.** Containers on the ground are line-white at 6–12% alpha with a 8–12% alpha hairline border, not a new colour. Green stays the only ground.

## Typography

**Display Font:** none. The system face is the display face.
**Body Font:** System (SF Pro on iOS, Roboto on Android)
**Label/Mono Font:** System, with `fontVariant: ['tabular-nums']` wherever digits change in place.

**Character:** Utilitarian and unfussy, doing all of its work through scale and weight. The drama is entirely in the jump from a 15pt caption to a 92pt score; nothing is styled, everything is sized.

### Hierarchy
- **Score Call** (800, 92pt, 96pt line, -3 letter-spacing, tabular): The spoken score on the scorer screen — serving side first. The win modal takes the same role to 104pt; the share card to 72pt.
- **Screen Title** (700, 34pt, 38pt line): Every screen opens with one, left-aligned at the 16pt text gutter, followed by a muted 15pt meta line. Home takes it to 800.
- **Modal Title** (800, 24pt; sheets 700, 26pt): Dialogs centre it; sheets left-align it beside a Done button.
- **Section Title** (700, 20pt): In-screen section heads ("Rack") with a 13pt muted hint on the same baseline.
- **Row Label** (500, 17pt): List rows and player names on court (names go to 700).
- **Button Label** (700, 16pt) with an optional 13pt/600 subtitle above it at 70% opacity.
- **Body** (400, 15pt, 21pt line): Meta lines, descriptions, dialog messages, empty states (600 when an empty state is the only thing on a surface).
- **Label** (600, 13pt, +0.4 tracking, uppercase in grouped-list headers): Captions and the header above a `ListGroup`.
- **Signage** (800, 11–12pt, +0.5–0.6 tracking, uppercase): Court-number pills and the NEXT UP rack tab. This is the world's painted signage, and it only ever labels a *container* — a court, a rack.

### Named Rules
**The Tabular Score Rule.** Any digit that changes in place — score, clock, games played, stepper value — is set in tabular numerals so nothing shifts sideways as it counts.

**The Signage-Labels-Containers Rule.** Uppercase tracked micro-type belongs on the tab or pill that names a structure. It never sits above a title as a category line: screen titles are followed by a sentence-case meta line, never preceded by a label.

## Layout

A single-column phone layout with two gutters. Prose, titles and grouped lists sit at a 16pt gutter; court diagrams, mode tiles and the rack sit at a 12pt gutter so the drawings run wider than the text that introduces them. Every screen is `SafeAreaView` with top and bottom edges, a `ScrollView` body, and — where there is a persistent action — a dock outside the scroll view with 16pt padding and 30pt of bottom padding for the home indicator.

Rhythm runs on a loose 2/4/8 base with named stops in use: 2pt between a title and its meta line, 8pt between side-by-side buttons, 10pt between mode tiles, 12pt above a court, 14pt inside a card or list row, 18–22pt before a new section, 20pt between stacked courts, 24pt at the bottom of a scroll body, 30pt under a dock.

Court drawings are governed by geometry rather than by the layout grid: `CourtDiagram` holds a 44:20 aspect ratio (2.2) unless given an explicit `height`, and the kitchen occupies 15.91% of the length either side of the net with the service courts filling 34.09% each. The rack wraps rather than scrolling sideways: the next four are full 68pt paddles in a row, everyone else waiting is a 48pt paddle head in a wrapping 6pt-gapped row.

Touch targets hold at 44pt minimum (toolbar items 60x44, stepper buttons 44x38, list rows 52pt minimum) with `hitSlop` of 6–10 on bare pressables.

### Named Rules
**The Real Proportions Rule.** A court is drawn at 44ft x 20ft with a 7ft kitchen each side of the net. Never fit a court to a convenient box; give it a height or let the aspect ratio decide.

**The Two-Gutter Rule.** Text lives at 16pt from the edge, drawings at 12pt. The drawing is always the wider element.

## Elevation & Depth

There are no shadows in this system. The shipped code contains zero `shadowColor`, `shadowOffset`, `shadowRadius` and `elevation` declarations. Depth is entirely tonal and comes from three moves: the ground is the darkest mid-green with a repeating grit tile behind everything; structures that rest on the ground (`rack`, `toolbar`) step one shade deeper (`court-outer-deep`); containers that merely group content are line-white at 6–12% alpha with a hairline border at 8–12% alpha. Only modals genuinely float, and they do it with a scrim (`#00000099` for sheets, `#000000aa` for dialogs) and a lighter surface green, not with a cast shadow.

The grit texture is the only ambient material. It is a generated 64x64 tileable speckle (seeded noise, ~6% light and ~6% dark grain at 4–9% alpha), applied once as a repeating `ImageBackground` at the root of `app/_layout.tsx`. Screens do not re-apply it and must not paint their own opaque background over it.

### Named Rules
**The No-Shadow Rule.** Nothing casts a shadow. If an element needs to feel above its neighbour, deepen it (`court-outer-deep`), tint it (line-white alpha), or put it behind a scrim.

**The One Ground Rule.** The grit texture and the green ground are applied once, at the root. Every screen background and every navigator `contentStyle` stays `transparent`.

## Shapes

Radius is assigned by what a thing *is*, not by a size scale. Courts are nearly square-cornered — 4pt on the full diagram, 2pt on the mini-court — because painted court lines do not have rounded corners; that near-sharpness is what separates a drawing of a court from a card. Buttons take 12pt, grouped lists and the rack take 14pt, mode tiles 16pt, sheets and dialogs 22pt (top corners only on sheets). Anything that reads as signage or a token — court-number pill, serving-player highlight, the toggle and its knob — is fully round (999pt).

Borders are hairlines of line-white at 8–20% alpha, except where they are court lines: those are 2pt solid line-white, and the 2pt court border, net, centre lines and kitchen lines are drawn as absolutely-positioned views rather than strokes. Empty court slots use a 1.5pt dashed line-white border at 50% alpha, the only dashed edge in the system, and the serve diagonal is drawn as nine 3pt dots so no SVG dependency is needed.

The paddle silhouette is the system's one true shape, defined once in `lib/theme/paddle-shape.ts` and shared by the app icon and every in-app paddle so the two cannot drift: a 200-unit box, a rounded face with shoulders that curve concavely into the neck, a 9-unit rubber edge-guard stroke, and a handle with a small butt-cap flare. Names sit at the face centre (y=0.37), games played at the handle centre (y=0.78).

### Named Rules
**The Sharp Court Rule.** Court geometry gets 2–4pt corners. Rounding a court into a card destroys the one thing this world is built on.

**The One Silhouette Rule.** The paddle shape comes from `lib/theme/paddle-shape.ts`. The icon generator and the app read the same constants; never redraw it locally.

## Components

### Buttons
- **Shape:** Softly rounded rectangle (12pt), 48–52pt tall, icon and label centred in a row with an 8pt gap.
- **Line (primary):** Line-white fill with deep-green label, 16pt horizontal padding. The single brightest element on a screen; used full-width for the one action that matters (Match done, Start session, confirm in a dialog).
- **Deep (secondary):** Near-black green fill with a line-white label and a 1pt 12%-alpha line-white border. Used for additive actions in a dock (Add player).
- **Outline (tertiary):** Transparent with a 1.5pt 55%-alpha line-white border and a line-white label. Used beside a primary for the lesser of two paired actions (Score, Undo, Done, Cancel).
- **Danger Text:** Transparent with a coral label. Destructive confirmation only; it is never a filled red button.
- **Press / Disabled:** Press scales the inner view to 0.97 and fires a light haptic; disabled drops to 45% opacity and blocks the press before the haptic.
- **Implementation:** The visual style sits on a `View` *inside* the `Pressable`, never on the `Pressable` itself.

### Cards / Containers
- **Corner Style:** 14pt for grouped lists and the rack, 16pt for mode tiles.
- **Background:** Line-white at 6% (`list-group`, mode tile) over the green ground; the rack instead takes the solid deeper green.
- **Shadow Strategy:** None. See Elevation & Depth.
- **Border:** 1pt line-white at 8–12% alpha; row dividers are 1pt at 8% alpha, inset 14pt from the left.
- **Internal Padding:** 14pt for tiles, 14pt horizontal / 8pt vertical for rows (12pt vertical when a row stacks its control beneath the label).

### Inputs / Controls
- **Segmented:** A line-white 8%-alpha track at 10pt radius with 3pt padding; the selected segment is a line-white 8pt-radius slab with deep-green label, unselected labels are muted mint. Minimum 38pt tall.
- **Toggle:** 51x31 fully-round track — line-white when on, line-white at 15% when off — with a 27pt knob that is outer-court green when on and near-white (#dfe7e2) when off. Selection haptic on change.
- **Stepper:** Line-white 8%-alpha 10pt-radius pill, minus and plus at 44x38 either side of a 17pt/700 tabular value; a disabled end drops to 35% opacity.
- **Disabled:** 35–55% opacity, plus an optional 12pt muted reason line under the row label rather than a tooltip.

### Sheets and Dialogs
- **Sheet:** Bottom sheet on court-surface green, 22pt top corners, a 38x5 line-white 25%-alpha grab handle, an optional 26pt/700 title paired with an outline Done button, and a scrolling body at the 16pt gutter. Scrim `#00000099`. Max height 80%.
- **Dialog:** Centred card on court-surface green, 22pt radius, 22pt padding, everything centre-aligned. An optional illustration (typically a `CourtDiagram` showing a change of ends) sits above a 24pt/800 title, then a 15pt muted message, then a stretched primary and an outline cancel 8pt below it. Scrim `#000000aa`.

### Navigation
- **Style:** Headerless. `expo-router` stack with `slide_from_right`, headers off, and transparent content so the root ground shows through. Each screen provides its own back affordance (`BackButton`) and its own 34pt title.
- **Scorer toolbar:** A bottom bar on deep court green with a 1pt 8%-alpha top hairline, items laid out `space-around` at minimum 60x44 with a 24pt icon above a 12pt/600 label, 4pt apart. Danger items take the coral ink; disabled items drop to 40%.

### Paddle (signature)
A paddle is a player. The face carries the name at 700 weight in that face's paired text colour; the grip wrap carries games played in tabular 800. Three sizes: `lg` (68pt wide, rack), `md` (64pt, check-in, number moves onto the face), `head` (48pt, waiting queue and summary). Four states, none of which use colour: **normal**, **outlined** (a line-white stroke around the face, 5 units wider than the edge guard, at 90% opacity — this is "next up"), **ghost** (transparent face, muted-mint text, stroked guard — not checked in), and **taped** (a 44x14 tan tape strip rotated -6° bridging two adjacent paddles — a locked pair). Press drops to 85% opacity with a borderless Android ripple.

### Court Diagram (signature)
A top-down court at 44:20, drawn from positioned views: 2pt line-white border, kitchen bands at 15.91% either side of a 2pt net, centre lines running only through the service courts. Player names sit in the four corners at 17pt/700 with a 10pt face-coloured dot, and the serving player's name becomes a fully-round line-white pill with a 12pt ball-yellow dot and deep-green text. Optional extras: a line-white court-number pill straddling the top line, a dark-blue clock chip on the net, and a nine-dot serve diagonal from the server to the diagonally opposite half. Empty slots in setup mode are dashed "+ Player" boxes; a court with nobody on it says so in the middle. One accessibility label describes the whole court ("Court 2. Ann and Ben versus Cass and Dee. 14:02").

### Motion
Entry animation on called matches: each of the four court slots enters with `SlideInDown.springify().damping(17)` staggered 60ms by slot index, so names appear to walk on. The rack's next-four fade in (`FadeIn` 200ms) and exit upward (`SlideOutUp.springify().damping(20)`) as they are called. Reduce Motion is read from `AccessibilityInfo` with a live listener and downgrades every entry to a 180ms crossfade. Screen transitions are the platform push; sheets slide, dialogs fade.

The direction contract's signature rack-to-court shared-element move is **not built**. What ships is the staggered entry plus the rack exit — two independent animations, not one continuous transfer.

### Named Rules
**The Inner-View Rule.** Under NativeWind, a `Pressable`'s `style` callback is dropped. Visual styling must live on a `View` inside the `Pressable`, with press state held in React state. This has broken twice; do not put a background, border or radius on a `Pressable` directly.

## Do's and Don'ts

### Do:
- **Do** style every screen from `lib/theme/tokens.ts` directly. NativeWind is still installed, but no screen uses its classes and none should.
- **Do** let `CourtDiagram` keep its 44:20 aspect ratio unless you have a reason to pass an explicit `height`.
- **Do** give a new player-facing colour a paired text colour that clears 4.5:1, and add it to `lib/theme/__tests__/tokens.test.ts` so it stays that way.
- **Do** put the one bright line-white fill on the single most important action per screen, and nowhere else.
- **Do** use tabular numerals for every value that changes in place.
- **Do** keep screen and navigator backgrounds transparent so the root grit ground shows through.
- **Do** put press-state visuals on an inner `View`, per the Inner-View Rule.
- **Do** read Reduce Motion from `AccessibilityInfo` and crossfade instead of moving.
- **Do** draw paddles from `lib/theme/paddle-shape.ts` so the app and the generated icons stay identical.

### Don't:
- **Don't** add a light/dark switch, a colour-scheme branch, or a theme toggle. The one appearance is the system.
- **Don't** add a shadow or an `elevation` value. The build has none; depth is tonal.
- **Don't** introduce a display typeface or a webfont. The system face is the only face.
- **Don't** add a second bright accent fill or a filled destructive button; destructive stays coral text.
- **Don't** spend `ball` yellow on anything but the serve marker and the server number.
- **Don't** give a paddle face to status. Faces are identity; use outline, ghost and tape for state.
- **Don't** round court geometry past 4pt or fit a court into an arbitrary box.
- **Don't** re-apply the grit texture, or paint an opaque background, inside a screen.
- **Don't** use emoji as icons.
