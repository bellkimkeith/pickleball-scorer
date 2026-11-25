import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { CustomSound } from './custom-sounds';

export interface SoundItem {
  id: string;
  name: string;
  category: 'hype' | 'classic' | 'meme';
}

export const SOUNDS: SoundItem[] = [
  { id: 'airhorn', name: 'Air Horn', category: 'hype' },
  { id: 'cheer', name: 'Cheer', category: 'hype' },
  { id: 'whistle', name: 'Whistle', category: 'classic' },
  { id: 'meme1', name: 'Meme 1', category: 'meme' },
  { id: 'meme2', name: 'Meme 2', category: 'meme' },
  { id: 'meme3', name: 'Meme 3', category: 'meme' },
];



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
  /** Files the user added themselves, keyed by sound id. */
  private customSources: Map<string, string> = new Map();
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

  /** Custom sounds are addressed by file URI; built-ins by bundled asset. */
  setCustomSounds(sounds: CustomSound[]): void {
    this.customSources = new Map(sounds.map(sound => [sound.id, sound.fileUri]));
  }

  private async loadSound(soundId: string): Promise<void> {
    const file: number | { uri: string } | undefined =
      SOUND_FILES[soundId] ?? (this.customSources.has(soundId) ? { uri: this.customSources.get(soundId)! } : undefined);
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

  async preloadAll(): Promise<void> {
    await this.preloadSounds([...SOUNDS.map(s => s.id), ...this.customSources.keys()]);
  }

  /** True when the sound can actually be played right now. */
  isAvailable(soundId: string): boolean {
    return SOUND_FILES[soundId] !== undefined || this.customSources.has(soundId);
  }

  forget(soundId: string): void {
    const player = this.loadedSounds.get(soundId);
    if (player) {
      player.release();
      this.loadedSounds.delete(soundId);
    }
    this.customSources.delete(soundId);
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
