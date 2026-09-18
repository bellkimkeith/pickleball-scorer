---
version: 1
slug: "app-queue-session-tsx"
primary_target: "app/queue/session.tsx"
related_targets: ["app/index.tsx","app/queue/index.tsx"]
---

## Scope

Open Play live session (primary) and the app-wide visual world it establishes: home, session setup, end-of-session summary, doubles/singles scorer, stats, settings. Mode: Operate.

## Audience and task

Organizer holding one phone courtside for ~2 hours, glancing between rallies in sun or under court lights. Job: call the next fair match in one tap, add late arrivals, mark sit-outs, and trust that games played stay equal.

## Direction contract

THESIS: Draw what players see. Courts are real top-down courts with each name in its playing position; the queue is the paddle rack every open-play group already uses. Refuses the category default of white cards, a green button and a plain list.

OWN-WORLD: The outer-court green ground (#2d5a48) with a faint acrylic grit, inner-court blue (#2c5c93) and a lighter kitchen blue (#3a6aa3), 2-inch white line color (#f4f6f2) as the only primary-button fill. Paddle faces are the only saturated color: ochre, coral, white, sky, carbon; each player keeps one paddle color all session. Grip-wrap handles carry games-played numbers, and tape joins locked pairs. System type (SF / Roboto); no display face.

STORY: The organizer sees at a glance who is on which court and side, who is next (the outlined paddles) and how many games each person has played (the handle numbers). They believe the rotation is fair because the counts are visible, and they act with Match done.

FIRST VIEWPORT: Large title "Open Play" with a live meta line; one court diagram per court (each ~124pt tall, a white pill with the court number on the top line, the clock on the net), with a full-width white Match done (48pt) plus Score beside it; then the paddle rack with the next four outlined under the NEXT UP tab; a bottom dock with Add player.

FORM: Court & Paddle Rack. My top-ranked grounded candidate (#1 on my ordered list), chosen over the assigned Next Up Board (#5). Seed key 957eee26.

Signature interaction: Match done slides the four outlined paddles out of the rack and onto the court positions (shared-element move); the rack settles left. Honors Reduce Motion with a crossfade.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decided

- Big groups: the next four stay as full-size paddles; everyone else waiting shows as small paddle heads (name + games) in queue order below. No horizontal swipe. (User choice B.)

## Unresolved

- How the scorer screen adopts the court world.
