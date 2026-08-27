/**
 * Web Audio API Sound Engine & Microphone Analyzer
 * Provides DJ soundboard effects, real mic volume detection, and audio synthesizers
 */

class AudioEngineService {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micDataArray: Uint8Array | null = null;
  private isMicActive = false;
  private ambientMusicOsc: OscillatorNode | null = null;
  private ambientMusicGain: GainNode | null = null;
  private isMusicPlaying = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play Sound Effects (synthesized via Web Audio API - no external broken audio URLs needed)
  public playSoundEffect(type: 'chime' | 'applause' | 'engine' | 'magic' | 'fanfare' | 'explosion' | 'airhorn' | 'cheer' | 'level_up' | 'coin') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (type) {
        case 'chime':
        case 'coin': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, now); // B5
          osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
        }

        case 'fanfare':
        case 'level_up': {
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);
            gain.gain.setValueAtTime(0.25, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.4);
          });
          break;
        }

        case 'airhorn': {
          // Classic DJ Reggae Air Horn synthesized frequencies
          const freqs = [466.16, 466.16, 466.16, 466.16];
          const times = [0, 0.12, 0.24, 0.38];
          times.forEach((t, i) => {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';
            osc1.frequency.setValueAtTime(587.33, now + t); // D5
            osc2.frequency.setValueAtTime(440.0, now + t); // A4
            gain.gain.setValueAtTime(0.3, now + t);
            gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.1);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.start(now + t);
            osc2.start(now + t);
            osc1.stop(now + t + 0.1);
            osc2.stop(now + t + 0.1);
          });
          break;
        }

        case 'applause':
        case 'cheer': {
          // White noise burst filtered for audience cheer
          const bufferSize = ctx.sampleRate * 1.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1200;
          filter.Q.value = 1.2;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(now);
          noise.stop(now + 1.5);
          break;
        }

        case 'engine': {
          // Sports car engine rev pitch ramp
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.6);
          osc.frequency.exponentialRampToValueAtTime(140, now + 1.2);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.4);
          break;
        }

        case 'magic':
        case 'explosion': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
        }
      }
    } catch (e) {
      console.warn('Audio effect playback suppressed:', e);
    }
  }

  // Toggle ambient background music for host room
  public toggleAmbientMusic(enable?: boolean): boolean {
    try {
      const ctx = this.getContext();
      const shouldPlay = enable !== undefined ? enable : !this.isMusicPlaying;

      if (shouldPlay && !this.isMusicPlaying) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3 calm drone
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        this.ambientMusicOsc = osc;
        this.ambientMusicGain = gain;
        this.isMusicPlaying = true;
        return true;
      } else if (!shouldPlay && this.isMusicPlaying) {
        if (this.ambientMusicOsc) {
          this.ambientMusicOsc.stop();
          this.ambientMusicOsc.disconnect();
          this.ambientMusicOsc = null;
        }
        this.isMusicPlaying = false;
        return false;
      }
    } catch (e) {
      console.warn('Ambient music error:', e);
    }
    return this.isMusicPlaying;
  }

  // Real Microphone Input Capture for speaking detection
  public async startMicrophoneCapture(onVolumeChange: (volume: number, isSpeaking: boolean) => void): Promise<boolean> {
    try {
      if (this.isMicActive) return true;
      const ctx = this.getContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micStream = stream;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      this.micAnalyser = analyser;
      this.micDataArray = new Uint8Array(analyser.frequencyBinCount);
      this.isMicActive = true;

      const updateVolume = () => {
        if (!this.isMicActive || !this.micAnalyser || !this.micDataArray) return;
        this.micAnalyser.getByteFrequencyData(this.micDataArray as any);
        let sum = 0;
        for (let i = 0; i < this.micDataArray.length; i++) {
          sum += this.micDataArray[i];
        }
        const avg = sum / this.micDataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        const isSpeaking = normalized > 12;
        onVolumeChange(normalized, isSpeaking);

        if (this.isMicActive) {
          requestAnimationFrame(updateVolume);
        }
      };

      requestAnimationFrame(updateVolume);
      return true;
    } catch (err) {
      console.warn('Microphone permission not granted or unavailable, fallback to simulated speaking.', err);
      return false;
    }
  }

  public stopMicrophoneCapture() {
    this.isMicActive = false;
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    this.micAnalyser = null;
    this.micDataArray = null;
  }
}

export const audioEngine = new AudioEngineService();
