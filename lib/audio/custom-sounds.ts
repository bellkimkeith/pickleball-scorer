export const MAX_CUSTOM_SOUND_MS = 5000;
export const MAX_CUSTOM_SOUND_BYTES = 2 * 1024 * 1024;
export const MAX_CUSTOM_SOUNDS = 24;
export const ALLOWED_SOUND_EXTENSIONS = ['mp3', 'm4a', 'aac', 'wav'] as const;

export interface CustomSound {
  id: string;
  name: string;
  fileUri: string;
  durationMs: number;
}

export interface CustomSoundCandidate {
  name: string;
  durationMs: number;
  bytes: number;
  existingCount: number;
}

export type CustomSoundRejection =
  | { ok: true }
  | { ok: false; reason: 'tooLong'; seconds: number; limitSeconds: number }
  | { ok: false; reason: 'tooBig'; megabytes: number; limitMegabytes: number }
  | { ok: false; reason: 'badFormat'; extension: string }
  | { ok: false; reason: 'tooMany'; limit: number };

/** Pure so the limits can be tested without touching the file system. */
export function validateCustomSound(candidate: CustomSoundCandidate): CustomSoundRejection {
  if (candidate.existingCount >= MAX_CUSTOM_SOUNDS) {
    return { ok: false, reason: 'tooMany', limit: MAX_CUSTOM_SOUNDS };
  }

  const extension = candidate.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_SOUND_EXTENSIONS.includes(extension as (typeof ALLOWED_SOUND_EXTENSIONS)[number])) {
    return { ok: false, reason: 'badFormat', extension };
  }

  if (candidate.bytes > MAX_CUSTOM_SOUND_BYTES) {
    return {
      ok: false,
      reason: 'tooBig',
      megabytes: Math.round((candidate.bytes / (1024 * 1024)) * 10) / 10,
      limitMegabytes: MAX_CUSTOM_SOUND_BYTES / (1024 * 1024),
    };
  }

  if (candidate.durationMs > MAX_CUSTOM_SOUND_MS) {
    return {
      ok: false,
      reason: 'tooLong',
      seconds: Math.round(candidate.durationMs / 100) / 10,
      limitSeconds: MAX_CUSTOM_SOUND_MS / 1000,
    };
  }

  return { ok: true };
}

/** "my clip.mp3" -> "my clip", capped at 20 characters. */
export function defaultSoundName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  return withoutExtension.trim().slice(0, 20) || 'Sound';
}
