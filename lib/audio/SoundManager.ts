import { Audio } from 'expo-av';

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
  { id: 'airhorn', name: 'Air Horn', category: 'hype', isPro: true },
  { id: 'cheer', name: 'Cheer', category: 'hype', isPro: true },
  { id: 'whistle', name: 'Whistle', category: 'classic', isPro: true },
  { id: 'meme1', name: 'Meme 1', category: 'meme', isPro: true },
  { id: 'meme2', name: 'Meme 2', category: 'meme', isPro: true },
  { id: 'meme3', name: 'Meme 3', category: 'meme', isPro: true },
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

class SoundManagerClass {
  private loadedSounds: Map<string, Audio.Sound> = new Map();
  private isInitialized = false;
  private team1Sound: string = 'airhorn';
  private team2Sound: string = 'cheer';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async preloadSounds(soundIds: string[]): Promise<void> {
    await this.initialize();
    
    const unloadPromises: Promise<void>[] = [];
    for (const id of soundIds) {
      if (!this.loadedSounds.has(id)) {
        unloadPromises.push(this.loadSound(id));
      }
    }
    await Promise.all(unloadPromises);
  }

  private async loadSound(soundId: string): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require(`../../assets/sounds/${soundId}.mp3`),
        { shouldPlay: false, volume: 1.0 }
      );
      this.loadedSounds.set(soundId, sound);
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
    
    let sound = this.loadedSounds.get(soundId);
    
    if (!sound) {
      await this.loadSound(soundId);
      sound = this.loadedSounds.get(soundId);
    }
    
    if (sound) {
      try {
        await sound.setPositionAsync(0);
        await sound.playAsync();
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
    const unloadPromises: Promise<unknown>[] = [];
    for (const sound of this.loadedSounds.values()) {
      unloadPromises.push(sound.unloadAsync() as Promise<unknown>);
    }
    await Promise.all(unloadPromises);
    this.loadedSounds.clear();
  }

  getLoadedSounds(): string[] {
    return Array.from(this.loadedSounds.keys());
  }
}

export const SoundManager = new SoundManagerClass();
