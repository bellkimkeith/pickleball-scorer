# Phase 3: Court & Paddle Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the tokens and shared components every Court & Paddle screen is made of, and prove they render correctly on a device.

**Architecture:** Colors live as Tailwind tokens (`tailwind.config.js`) plus a plain TypeScript copy (`lib/theme/tokens.ts`) for places NativeWind classes can't reach (SVG fills, shadows). Components split into `components/court/` (the world: court diagram, paddles, rack) and `components/ui/` (the chrome: buttons, rows, toggles, sheets). No screen is changed in this phase; Phase 4 and 5 consume these.

**Tech Stack:** React Native 0.83, NativeWind 4, react-native-svg (already a dependency via Expo), Ionicons, TypeScript strict.

**Spec:** `docs/superpowers/specs/2026-09-18-open-play-and-redesign-design.md` §5
**Direction contract:** `.impeccable/surfaces/app-queue-session-tsx.md`
**Approved mockups:** `.superpowers/brainstorm/36629-1789743181/content/all-screens.html`

## Global Constraints

- Typecheck: `npx tsc --noEmit --types react,node,jest`. Lint: 0 errors. Tests: `npm test` stays green (38 passing).
- One appearance: these components do not branch on light/dark. The court world is the same either way.
- Touch targets at least 44pt high; primary buttons 48–52pt.
- Text uses system fonts and respects font scaling. Scores and counts use `fontVariant: ['tabular-nums']`.
- Colors come from tokens only. No hex literals inside components except inside SVG where a token is passed in.
- Every component takes an optional `className` (NativeWind) or `style` so screens can place it without wrapper views.

**Token table (spec §5.1):**

| Token | Value |
|---|---|
| `court-outer` | `#2d5a48` |
| `court-outer-deep` | `#1f4134` |
| `court-surface` | `#23473a` |
| `court-inner` | `#2c5c93` |
| `court-kitchen` | `#3a6aa3` |
| `court-line` | `#f4f6f2` |
| `ink` | `#f4f6f2` |
| `ink-muted` | `#b9cfc5` |
| `deep` | `#10231c` |
| `danger` | `#ffb4a6` |
| `ball` | `#e9e24a` |
| paddle `ochre` | `#e3a33b` |
| paddle `coral` | `#e0634a` |
| paddle `paper` | `#f2efe8` |
| paddle `sky` | `#8fc3e6` |
| paddle `carbon` | `#2f3130` |
| paddle `lilac` | `#b9a6e0` |
| paddle `sand` | `#d9c39a` |
| paddle `teal` | `#4fb3a5` |

Paddle text colors (all ≥ 4.5:1 on their face): ochre `#2b1d05`, coral `#2a0c05`, paper `#1d2a24`, sky `#0d2638`, carbon `#f1f1ef`, lilac `#1f1636`, sand `#2a2110`, teal `#06261f`.

---

### Task 1: Tokens

**Files:**
- Create: `lib/theme/tokens.ts`
- Modify: `tailwind.config.js`
- Create: `lib/theme/__tests__/tokens.test.ts`

**Interfaces:**
- Produces: `COURT`, `PADDLE_FACE: Record<PaddleColor, string>`, `PADDLE_TEXT: Record<PaddleColor, string>`, `contrastRatio(a: string, b: string): number`.

- [ ] **Step 1: Write the failing test** (`lib/theme/__tests__/tokens.test.ts`): every paddle color has a face and a text color; `contrastRatio(PADDLE_TEXT[c], PADDLE_FACE[c]) >= 4.5` for all eight; muted ink on the court ground is at least 4.5; the ball color is not used as a paddle face.
- [ ] **Step 2:** Run `npx jest tokens`; expect module not found.
- [ ] **Step 3:** Write `lib/theme/tokens.ts` with the table above and a small WCAG relative-luminance `contrastRatio` implementation.
- [ ] **Step 4:** Run `npx jest tokens`; all pass. If a pair fails, darken or lighten the *text* color until it passes, never the face.
- [ ] **Step 5:** Add the same colors to `tailwind.config.js` under `theme.extend.colors` as `court: { outer, outerDeep, surface, inner, kitchen, line }`, `ink`, `inkMuted`, `deep`, `danger`, `ball`, and `paddle: { … }`. Leave the existing `primary` / `team1` / `team2` tokens alone; Phase 5 removes them once no screen uses them.
- [ ] **Step 6:** Typecheck, lint, commit: `git commit -am "feat: court and paddle design tokens"`

---

### Task 2: CourtDiagram

**Files:**
- Create: `components/court/CourtDiagram.tsx`

**Interfaces:**

```ts
export interface CourtSlotPlayer {
  id: string;
  name: string;
  color: PaddleColor;
}

export interface CourtDiagramProps {
  /** Four slots: [nearTop, nearBottom, farTop, farBottom]; null renders an empty slot. */
  players: (CourtSlotPlayer | null)[];
  courtLabel?: string;            // pill on the top line, e.g. "COURT 1"
  clock?: string;                 // e.g. "08:14", drawn on the net
  servingPlayerId?: string;       // draws the ball marker and highlight
  showServeDiagonal?: boolean;    // dashed line from server to the diagonal receiver
  height?: number;                // default 124
  emptyLabel?: string;            // shown centred when every slot is null
  onSlotPress?: (index: number) => void;   // setup mode
  onPlayerPress?: (id: string) => void;
  accessibilityLabel?: string;    // defaults to a generated sentence
}
```

- [ ] **Step 1:** Build it with plain `View`s (no SVG needed): a `court-inner` rectangle with a 2pt `court-line` border, two `court-kitchen` bands at 27%–50% and 50%–73%, a 2pt centre (net) line, and service centre lines on the outer thirds. Slots are absolutely positioned; each shows a paddle-colour dot plus the name.
- [ ] **Step 2:** The serving player's name renders as a `court-line` pill with dark text and a ball dot; the serve diagonal is a dashed line (`borderStyle: 'dashed'` on a rotated view is fragile, so draw it with `react-native-svg`'s `Line` with `strokeDasharray`).
- [ ] **Step 3:** Empty state: when every slot is null, render `emptyLabel` centred in `ink-muted`.
- [ ] **Step 4:** Accessibility: the whole diagram is one `accessible` element whose label reads, for example, "Court 1. Maria and Carlo versus Bea and Jun. 8 minutes." Individual slots are only focusable when `onSlotPress` or `onPlayerPress` is set.
- [ ] **Step 5:** Names truncate with `numberOfLines={1}` and `ellipsizeMode="tail"`; the layout never overlaps at a 1.3 font scale.
- [ ] **Step 6:** Typecheck and lint. Commit: `git commit -am "feat: court diagram component"`

---

### Task 3: Paddle and PaddleRack

**Files:**
- Create: `components/court/Paddle.tsx`
- Create: `components/court/PaddleRack.tsx`

**Interfaces:**

```ts
export type PaddleSize = 'lg' | 'md' | 'head';

export interface PaddleProps {
  name: string;
  color: PaddleColor;
  games?: number;          // printed on the grip (lg/md) or beside the name (head)
  size?: PaddleSize;       // default 'lg'
  outlined?: boolean;      // next up
  ghost?: boolean;         // not checked in
  note?: string;           // small line under the name, e.g. "late"
  onPress?: () => void;
  onLongPress?: () => void;
}

export interface PaddleRackProps {
  next: RackPlayer[];      // full-size paddles under the NEXT UP tab
  waiting: RackPlayer[];   // small heads in queue order
  lockedPairs?: [string, string][];  // tape between adjacent locked paddles
  onPlayerPress?: (id: string) => void;
  emptyLabel?: string;
}

export interface RackPlayer { id: string; name: string; color: PaddleColor; games: number; note?: string; }
```

- [ ] **Step 1: Paddle.** Face is a rounded rect (26pt top radius, 18pt bottom) in the paddle color with the name at the bottom; grip is a 20pt-wide dark strip with the games number. `ghost` renders a transparent face with a 1.5pt `court-line` border at 40% opacity. `outlined` adds a 2pt `court-line` outline with 2pt offset. Sizes: `lg` 62×162, `md` 62×76 (face only, no grip), `head` 42×54.
- [ ] **Step 2: Accessibility.** Each paddle is one button labelled "<name>, <games> games<, next up><, sitting out>".
- [ ] **Step 3: PaddleRack.** A `court-outer-deep` panel with a "NEXT UP" tab, the `next` paddles in a row, then the `waiting` heads wrapping in a grid below (the layout you chose: option B). Locked pairs get a tape strip drawn across the two adjacent paddles. When both lists are empty, show `emptyLabel`.
- [ ] **Step 4:** Typecheck and lint. Commit: `git commit -am "feat: paddle and paddle rack components"`

---

### Task 4: UI chrome

**Files:**
- Create: `components/ui/Button.tsx`, `ListGroup.tsx`, `Segmented.tsx`, `Toggle.tsx`, `Stepper.tsx`, `Sheet.tsx`, `Dialog.tsx`, `Toolbar.tsx`

**Interfaces:**

```ts
// Button
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'line' | 'deep' | 'outline' | 'dangerText';  // default 'line'
  subtitle?: string;          // small line above the title, e.g. "Rally won by"
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  height?: number;            // default 50
  haptic?: boolean;           // default true, Haptics.impactAsync on press
  className?: string;
}

// ListGroup / ListRow
interface ListGroupProps { header?: string; children: ReactNode; className?: string; }
interface ListRowProps {
  label: string;
  value?: string;
  right?: ReactNode;          // toggle, segmented, stepper
  chevron?: boolean;
  disabled?: boolean;
  disabledReason?: string;    // shown under the label when disabled
  onPress?: () => void;
  destructive?: boolean;
}

interface SegmentedProps<T extends string> { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; }
interface ToggleProps { value: boolean; onChange: (v: boolean) => void; accessibilityLabel: string; disabled?: boolean; }
interface StepperProps { value: number; min: number; max: number; onChange: (v: number) => void; accessibilityLabel: string; }
interface SheetProps { visible: boolean; onClose: () => void; children: ReactNode; title?: string; }
interface DialogProps { visible: boolean; title: string; message?: string; illustration?: ReactNode; confirmLabel: string; onConfirm: () => void; cancelLabel?: string; onCancel?: () => void; }
interface ToolbarProps { items: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; disabled?: boolean; danger?: boolean }[]; }
```

- [ ] **Step 1:** `Button`: `line` is `court-line` fill with `#1d3d31` text; `deep` is `deep` fill with `ink` text and a hairline border; `outline` is transparent with a `court-line` border at 55% opacity; `dangerText` is text-only in `danger`. Disabled drops to 45% opacity and blocks press. Press feedback: scale to 0.97 and a light haptic.
- [ ] **Step 2:** `ListGroup` / `ListRow`: rows 52pt tall on a translucent white panel (`#ffffff0f`) with hairline separators and a 14pt radius; `disabledReason` renders as a 12pt `ink-muted` line and sets `accessibilityState.disabled`.
- [ ] **Step 3:** `Segmented`, `Toggle` (51×31, `court-line` track when on with a `court-outer` knob), `Stepper` (− value +, 44pt targets, disabled at min/max).
- [ ] **Step 4:** `Sheet` (bottom sheet on a `court-surface` panel with a grab handle, `Modal` with `transparent`, closes on backdrop press and honours `onClose`), `Dialog` (centred `court-surface` card with optional illustration, confirm in `line`, cancel as muted text), `Toolbar` (a `court-outer-deep` bar with icon-over-label items, 44pt targets, `danger` item in `danger` color).
- [ ] **Step 5:** All of these honour `AccessibilityInfo.isReduceMotionEnabled` by skipping the scale animation; they use no entrance animation of their own.
- [ ] **Step 6:** Typecheck and lint. Commit: `git commit -am "feat: court-and-paddle UI components"`

---

### Task 5: Visual check on a device

A temporary gallery route renders every component with real content so it can be screenshotted, then it is deleted; it never ships.

**Files:**
- Create then delete: `app/_gallery.tsx`

- [ ] **Step 1:** Create `app/_gallery.tsx`: a scrolling screen on the `court-outer` ground showing, in order: two `CourtDiagram`s (one live with a server and clock, one empty), a `PaddleRack` with 4 next + 8 waiting + one locked pair, all four `Button` variants, a `ListGroup` with a toggle, segmented control, stepper and a disabled row with a reason, the `Toolbar`, and buttons that open the `Sheet` and the `Dialog`.
- [ ] **Step 2:** Start Metro (`npx expo start --dev-client`), open the app on the Android emulator, deep-link to `/_gallery`, and screenshot it (`adb exec-out screencap -p`). Also screenshot the open sheet and the open dialog.
- [ ] **Step 3:** Inspect the screenshots against the approved mockup: court proportions, kitchen bands, paddle shape and grip, rack layout, button weights, row rhythm, toggle and stepper sizing. Fix every mismatch in one batch, then re-screenshot once.
- [ ] **Step 4:** Check a large font scale: `adb shell settings put system font_scale 1.3`, re-open the gallery, screenshot, confirm nothing clips or overlaps, then restore with `adb shell settings put system font_scale 1.0`.
- [ ] **Step 5:** Delete `app/_gallery.tsx`.
- [ ] **Step 6:** Run `npm test`, typecheck, lint. Commit: `git commit -am "chore: verify design system components on device"`
- [ ] **Step 7:** Report to the user with the screenshots described, and confirm Phase 4 (Open Play screens) is next.
