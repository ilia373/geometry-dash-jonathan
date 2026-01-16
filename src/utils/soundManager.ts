// Sound Manager for game audio

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private backgroundMusic: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.5;

  constructor() {
    // Pre-load sounds
    this.loadSound('jump', '/sounds/jump.mp3');
    this.loadSound('fail', '/sounds/fail.mp3');
    this.loadSound('success', '/sounds/success.mp3');
    this.loadSound('coin', '/sounds/coin.mp3');
    this.loadBackgroundMusic('/sounds/background.mp3');
  }

  private loadSound(name: string, path: string): void {
    const audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = this.sfxVolume;
    this.sounds.set(name, audio);
  }

  private loadBackgroundMusic(path: string): void {
    this.backgroundMusic = new Audio(path);
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = this.musicVolume;
    this.backgroundMusic.preload = 'auto';
  }

  playSound(name: string): void {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      // Clone the audio to allow overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.sfxVolume;
      clone.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }

  playBackgroundMusic(): void {
    if (this.backgroundMusic && !this.isMuted) {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.play().catch(() => {
        // Autoplay might be blocked, will start on user interaction
        console.log('Background music will start on first interaction');
      });
    }
  }

  pauseBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  resumeBackgroundMusic(): void {
    if (this.backgroundMusic && !this.isMuted) {
      this.backgroundMusic.play().catch(() => {});
    }
  }

  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.pauseBackgroundMusic();
    } else {
      this.resumeBackgroundMusic();
    }
    
    return this.isMuted;
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }
}

// Singleton instance
export const soundManager = new SoundManager();
