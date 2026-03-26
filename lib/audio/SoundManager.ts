import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

export interface SoundItem {
  id: string;
  name: string;
  category: 'hype' | 'classic' | 'meme';
  isPro: boolean;
}

export const FREE_SOUNDS: SoundItem[] = [
  { id: 'airhorn', name: 'Air Horn', category: 'hype', isPro: false },
  { id: 'cheer', name: 'Cheer', category: 'hype', isPro: false },
  { id: 'whistle', name: 'Whistle', category: 'classic', isPro: false },
  { id: 'meme1', name: 'Meme 1', category: 'meme', isPro: false },
  { id: 'meme2', name: 'Meme 2', category: 'meme', isPro: false },
  { id: 'meme3', name: 'Meme 3', category: 'meme', isPro: false },
];

export const PRO_SOUNDS: SoundItem[] = [
  { id: 'crowd', name: 'Crowd', category: 'hype', isPro: true },
  { id: 'applause', name: 'Applause', category: 'hype', isPro: true },
  { id: 'boom', name: 'Boom', category: 'hype', isPro: true },
  { id: 'bell', name: 'Bell', category: 'classic', isPro: true },
  { id: 'horn', name: 'Horn', category: 'classic', isPro: true },
  { id: 'buzzer', name: 'Buzzer', category: 'classic', isPro: true },
  { id: 'laugh1', name: 'Laugh 1', category: 'meme', isPro: true },
  { id: 'laugh2', name: 'Laugh 2', category: 'meme', isPro: true },
  { id: 'wow', name: 'Wow', category: 'meme', isPro: true },
  { id: 'noice', name: 'Noice', category: 'meme', isPro: true },
  { id: 'yeet', name: 'Yeet', category: 'meme', isPro: true },
  { id: 'fail', name: 'Fail', category: 'meme', isPro: true },
  { id: 'trombone', name: 'Trombone', category: 'meme', isPro: true },
  { id: 'rimshot', name: 'Rimshot', category: 'meme', isPro: true },
  { id: 'sad', name: 'Sad', category: 'meme', isPro: true },
  { id: 'village', name: 'Village', category: 'meme', isPro: true },
  { id: 'taco', name: 'Taco', category: 'meme', isPro: true },
  { id: 'viking', name: 'Viking', category: 'hype', isPro: true },
];

export const ALL_SOUNDS: SoundItem[] = [...FREE_SOUNDS, ...PRO_SOUNDS];

const SOUND_FILES: Record<string, number> = {
  airhorn: require('../../assets/sounds/airhorn.mp3'),
  cheer: require('../../assets/sounds/cheer.mp3'),
  whistle: require('../../assets/sounds/whistle.mp3'),
  meme1: require('../../assets/sounds/meme1.mp3'),
  meme2: require('../../assets/sounds/meme2.mp3'),
  meme3: require('../../assets/sounds/meme3.mp3'),
};

class SoundManagerClass {
  private loadedSounds: Map<string, AudioPlayer> = new Map();
  private isInitialized = false;
  private team1Sound: string = 'airhorn';
  private team2Sound: string = 'cheer';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async preloadSounds(soundIds: string[]): Promise<void> {
    await this.initialize();

    const loadPromises: Promise<void>[] = [];
    for (const id of soundIds) {
      if (!this.loadedSounds.has(id)) {
        loadPromises.push(this.loadSound(id));
      }
    }
    await Promise.all(loadPromises);
  }

  private async loadSound(soundId: string): Promise<void> {
    const file = SOUND_FILES[soundId];
    if (!file) {
      console.warn(`No sound file found for "${soundId}"`);
      return;
    }
    try {
      const player = createAudioPlayer(file);
      player.volume = 1.0;
      this.loadedSounds.set(soundId, player);
    } catch (error) {
      console.warn(`Failed to load sound ${soundId}:`, error);
    }
  }

  async preloadAllFreeSounds(): Promise<void> {
    const freeSoundIds = FREE_SOUNDS.map(s => s.id);
    await this.preloadSounds(freeSoundIds);
  }

  async preloadAllProSounds(): Promise<void> {
    const allSoundIds = ALL_SOUNDS.map(s => s.id);
    await this.preloadSounds(allSoundIds);
  }

  async play(soundId: string): Promise<void> {
    await this.initialize();

    let player = this.loadedSounds.get(soundId);

    if (!player) {
      await this.loadSound(soundId);
      player = this.loadedSounds.get(soundId);
    }

    if (player) {
      try {
        player.seekTo(0);
        player.play();
      } catch (error) {
        console.warn(`Failed to play sound ${soundId}:`, error);
      }
    }
  }

  async playTeamSound(team: 1 | 2): Promise<void> {
    const soundId = team === 1 ? this.team1Sound : this.team2Sound;
    await this.play(soundId);
  }

  setTeamSound(team: 1 | 2, soundId: string): void {
    if (team === 1) {
      this.team1Sound = soundId;
    } else {
      this.team2Sound = soundId;
    }
  }

  getTeamSound(team: 1 | 2): string {
    return team === 1 ? this.team1Sound : this.team2Sound;
  }

  async unloadAll(): Promise<void> {
    for (const player of this.loadedSounds.values()) {
      player.release();
    }
    this.loadedSounds.clear();
  }

  getLoadedSounds(): string[] {
    return Array.from(this.loadedSounds.keys());
  }
}

export const SoundManager = new SoundManagerClass();
