#!/usr/bin/env node
/**
 * Builds every app icon asset from one vector source.
 *
 * The paddle is drawn from real brand dimensions (Selkirk Invikta, JOOLA
 * Perseus, CRBN 3X are all 16.5in long, 7.5in wide, 5.25in handle), with the
 * face shortened and the handle lengthened a little so the silhouette still
 * reads as a paddle at 40px.
 *
 *   node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const OUT = 'assets';

const COLOR = {
  bgTop: '#35684f',
  bgBottom: '#1a382e',
  faceLight: '#f0b755',
  faceDark: '#bd8026',
  guard: '#17181a',
  handle: '#191919',
  ballLight: '#fbf68e',
  ballDark: '#cfc73a',
  hole: '#0000003d',
  ground: '#2d5a48',
};

const FACE_PATH = `
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

const HANDLE_PATH = `
  M 93 124 L 107 124 L 107 176
  C 110 177, 112 179, 112 182
  L 112 187
  C 112 189, 111 190, 109 190
  L 91 190
  C 89 190, 88 189, 88 187
  L 88 182
  C 88 179, 90 177, 93 176 Z`;

/** One centre hole and six on a ring: what reads as a pickleball at icon size. */
function ballHoles(cx, cy, r) {
  const ring = r * 0.5;
  const hole = r * 0.135;
  const holes = [`<circle cx="${cx}" cy="${cy}" r="${hole}" fill="${COLOR.hole}"/>`];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    holes.push(
      `<circle cx="${(cx + Math.cos(a) * ring).toFixed(2)}" cy="${(cy + Math.sin(a) * ring).toFixed(2)}" r="${hole}" fill="${COLOR.hole}"/>`,
    );
  }
  return holes.join('');
}

/**
 * @param {object} options
 * @param {boolean} options.background  paint the green ground (iOS) or leave it clear (Android foreground)
 * @param {number}  options.scale       shrink the paddle, for Android's safe zone
 */
function iconSvg({ background = true, scale = 1 } = {}) {
  const ball = { x: 152, y: 48, r: 23 };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${COLOR.bgTop}"/>
      <stop offset="1" stop-color="${COLOR.bgBottom}"/>
    </linearGradient>
    <linearGradient id="face" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="${COLOR.faceLight}"/>
      <stop offset="1" stop-color="${COLOR.faceDark}"/>
    </linearGradient>
    <radialGradient id="ball" cx="0.35" cy="0.3" r="0.75">
      <stop offset="0" stop-color="${COLOR.ballLight}"/>
      <stop offset="1" stop-color="${COLOR.ballDark}"/>
    </radialGradient>
    <!-- Sandpaper, not polka dots: a fine irregular grain. -->
    <pattern id="grit" width="3.1" height="3.1" patternUnits="userSpaceOnUse">
      <circle cx="0.7" cy="0.9" r="0.26" fill="#00000024"/>
      <circle cx="2.3" cy="0.5" r="0.2" fill="#ffffff2b"/>
      <circle cx="2.6" cy="2.1" r="0.26" fill="#00000024"/>
      <circle cx="1.2" cy="2.4" r="0.2" fill="#ffffff24"/>
      <circle cx="1.9" cy="1.5" r="0.16" fill="#00000020"/>
    </pattern>
    <clipPath id="faceClip"><path d="${FACE_PATH}"/></clipPath>
    <filter id="drop" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  ${background ? '<rect width="200" height="200" fill="url(#bg)"/>' : ''}
  <g transform="translate(100 100) scale(${scale}) translate(-100 -100)">
    <g filter="url(#drop)">
      <path d="${HANDLE_PATH}" fill="${COLOR.handle}"/>
      <!-- edge guard: the rubber band that wraps a real paddle's head -->
      <path d="${FACE_PATH}" fill="${COLOR.guard}" stroke="${COLOR.guard}" stroke-width="9" stroke-linejoin="round"/>
      <path d="${FACE_PATH}" fill="url(#face)"/>
      <g clip-path="url(#faceClip)" opacity="0.8">
        <rect x="55" y="16" width="90" height="118" fill="url(#grit)"/>
      </g>
      <path d="${FACE_PATH}" fill="none" stroke="#ffffff14" stroke-width="1.2"/>
    </g>
    <circle cx="${ball.x}" cy="${ball.y}" r="${ball.r}" fill="url(#ball)"/>
    ${ballHoles(ball.x, ball.y, ball.r)}
  </g>
</svg>`;
}

/** Splash: the same paddle, small and centred on the court ground. */
function splashSvg(width, height) {
  const size = Math.round(Math.min(width, height) * 0.34);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${COLOR.ground}"/>
  <g transform="translate(${(width - size) / 2} ${(height - size) / 2}) scale(${size / 200})">
    ${iconSvg({ background: false })
      .replace(/^<svg[^>]*>/, '')
      .replace(/<\/svg>$/, '')}
  </g>
</svg>`;
}

const targets = [
  // iOS: square, no transparency, no rounded corners (the system masks it).
  { file: `${OUT}/icon.png`, svg: iconSvg({ background: true, scale: 0.9 }), size: 1024 },
  // Android adaptive foreground: transparent, inside the centre safe zone.
  { file: `${OUT}/adaptive-icon.png`, svg: iconSvg({ background: false, scale: 0.62 }), size: 1024 },
  // Splash mark, on the court ground.
  { file: `${OUT}/splash-icon.png`, svg: iconSvg({ background: false, scale: 0.8 }), size: 1024 },
  { file: `${OUT}/favicon.png`, svg: iconSvg({ background: true, scale: 0.9 }), size: 64 },
];

for (const target of targets) {
  await sharp(Buffer.from(target.svg))
    .resize(target.size, target.size)
    .png()
    .toFile(target.file);
  console.log('wrote', target.file, `${target.size}x${target.size}`);
}

for (const [file, w, h] of [
  [`${OUT}/splash.png`, 1284, 2778],
  [`${OUT}/splash-android.png`, 1080, 1920],
]) {
  await sharp(Buffer.from(splashSvg(w, h))).png().toFile(file);
  console.log('wrote', file, `${w}x${h}`);
}

writeFileSync(
  `${OUT}/ICONS.md`,
  `# App icons

Generated by \`node scripts/generate-icons.mjs\`. The source of truth is that
script, not these PNGs: edit it and re-run rather than touching the images.

The paddle is drawn from real brand dimensions (16.5in long, 7.5in wide, 5.25in
handle, per Selkirk Invikta / JOOLA Perseus / CRBN 3X), with the face shortened
and the handle lengthened slightly so the silhouette still reads at 40px.

- \`icon.png\` — iOS, 1024px, opaque, square (iOS applies its own mask)
- \`adaptive-icon.png\` — Android foreground, transparent, paddle at 62% so it
  survives every mask shape; the background colour lives in \`app.json\`
- \`splash-icon.png\`, \`splash.png\`, \`splash-android.png\` — launch screens
- \`favicon.png\` — web
`,
);
console.log('wrote', `${OUT}/ICONS.md`);

// ---------------------------------------------------------------------------
// Native projects keep their own copies of the icon, so write those too.
// (This repo checks in android/ and ios/, so `expo prebuild` is not run.)
// ---------------------------------------------------------------------------
const ANDROID_RES = 'android/app/src/main/res';
const DENSITIES = [
  ['mdpi', 48, 108],
  ['hdpi', 72, 162],
  ['xhdpi', 96, 216],
  ['xxhdpi', 144, 324],
  ['xxxhdpi', 192, 432],
];

const legacySvg = iconSvg({ background: true, scale: 0.9 });
const foregroundSvg = iconSvg({ background: false, scale: 0.62 });

for (const [density, launcher, foreground] of DENSITIES) {
  const dir = `${ANDROID_RES}/mipmap-${density}`;
  await sharp(Buffer.from(legacySvg)).resize(launcher, launcher).webp({ quality: 95 })
    .toFile(`${dir}/ic_launcher.webp`);
  await sharp(Buffer.from(legacySvg)).resize(launcher, launcher).webp({ quality: 95 })
    .toFile(`${dir}/ic_launcher_round.webp`);
  await sharp(Buffer.from(foregroundSvg)).resize(foreground, foreground).webp({ quality: 95 })
    .toFile(`${dir}/ic_launcher_foreground.webp`);
  console.log('wrote', `${dir}/ic_launcher*.webp`);
}

await sharp(Buffer.from(iconSvg({ background: true, scale: 0.9 })))
  .resize(1024, 1024)
  .png()
  .toFile('ios/PickleScore/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png');
console.log('wrote ios App-Icon-1024x1024@1x.png');
