# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

- **Group organizers** who run recreational pickleball open-play sessions: one phone, courtside, managing who plays next across one or more courts for the whole session (often ~2 hours), while also playing themselves.
- **Players keeping score** of their own singles or doubles games.

## Product Purpose

Pickleball Scorer keeps score correctly (side-out and rally scoring, server number, side switches) and runs open-play queues so that every player in a group gets equal playing time, whether they win or lose. Success means that groups who pay the same court fee leave having played the same number of games, and that the organizer spends seconds per rotation, not minutes.

## Positioning

The queue enforces fairness by rules, not by win/lose stacking: fewest games played goes next, late arrivals join at the group's current level, partners rotate unless deliberately locked. A paid, one-time purchase app: no ads, no subscriptions, no feature gates.

## Operating Context

- Used outdoors or in covered courts, often in bright sun or evening lighting, glanced at between rallies, sometimes with sweaty hands.
- Players arrive at different times; everyone usually leaves together. Breaks (water, rest) are common.
- 1–6 courts per session. Doubles is the open-play norm.
- Works fully offline on one organizer device; no accounts or sync.

## Capabilities and Constraints

- Existing: singles and doubles scorer, undo, configurable winning score / win-by-two / side change, soundboard, recent match stats, share card, dark mode, languages en/es/fr/de.
- Planned: open-play queue (live session, equal games, rotating partners, lockable fixed pairs, late arrivals, sit-outs, multiple courts, saved player list).
- Pricing: one-time paid download (e.g. ₱199 in the Philippines). Existing paywall/subscription code is to be removed.
- One shared branded visual identity on iOS and Android; system behaviors (navigation gestures, haptics, sheets, safe areas) follow each OS.
- Stack: Expo SDK 54, React Native 0.81, Expo Router, NativeWind, Zustand.
- Global release from day one.

## Evidence on Hand

No testimonials, user counts, ratings, press, or partner logos exist. Future work must not invent them.

## Product Principles

1. Fairness is the product: equal games for everyone regardless of result.
2. Courtside speed: any common action is one tap and readable at a glance.
3. Paid means complete: no upsells, nags, or locked features anywhere.
4. Never lose a session: state survives app kills and phone locks.
5. The organizer stays in control: every automatic choice can be overridden.

## Accessibility & Inclusion

Must remain legible in direct sunlight and at arm's length; large touch targets for outdoor use. No formal standard has been specified.
