/**
 * The paddle silhouette, shared by the app icon and the in-app paddles so the
 * two can never drift apart. Drawn from real brand dimensions (Selkirk Invikta,
 * JOOLA Perseus and CRBN 3X are all 16.5in long, 7.5in wide, 5.25in handle),
 * with the face shortened and the handle lengthened a little so the shape still
 * reads at icon and rack sizes.
 *
 * Coordinates are in a 200x200 box; `scripts/generate-icons.mjs` uses the same
 * numbers.
 */
export const PADDLE_VIEWBOX = 200;

/** Face and neck: shoulders curve inward into the handle (a concave fillet). */
export const PADDLE_FACE_PATH = `
  M 76 20 L 124 20
  C 133 20, 140 27, 140 36
  L 140 94
  C 140 103, 136 109, 128 112
  C 117 116, 108 121, 108 132
  L 92 132
  C 92 121, 83 116, 72 112
  C 64 109, 60 103, 60 94
  L 60 36
  C 60 27, 67 20, 76 20 Z`;

/** Handle with the small flare of a butt cap. */
export const PADDLE_HANDLE_PATH = `
  M 93 124 L 107 124 L 107 176
  C 110 177, 112 179, 112 182
  L 112 187
  C 112 189, 111 190, 109 190
  L 91 190
  C 89 190, 88 189, 88 187
  L 88 182
  C 88 179, 90 177, 93 176 Z`;

/** The rubber edge guard is this stroke width around the face outline. */
export const PADDLE_GUARD_WIDTH = 9;

/** Where a name sits on the face, as a fraction of the box. */
export const PADDLE_FACE_CENTER = { x: 100 / PADDLE_VIEWBOX, y: 74 / PADDLE_VIEWBOX };

/** Where the games number sits on the handle. */
export const PADDLE_HANDLE_CENTER = { x: 100 / PADDLE_VIEWBOX, y: 156 / PADDLE_VIEWBOX };
