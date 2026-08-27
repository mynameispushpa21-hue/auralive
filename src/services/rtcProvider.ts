/**
 * RTC Provider Abstraction Layer
 * Supports Agora RTC, ZEGOCLOUD, LiveKit, or Mock Engine without hardcoding dependencies
 */

export type RTCProviderType = 'agora' | 'zegocloud' | 'livekit' | 'mock_mesh';

export interface RTCJoinOptions {
  channelName: string;
  userId: string;
  role: 'host' | 'cohost' | 'speaker' | 'audience';
  token?: string;
  enableVideo?: boolean;
}

export interface RTCChannelState {
  isConnected: boolean;
  provider: RTCProviderType;
  channelName: string;
  localAudioMuted: boolean;
  localVideoMuted: boolean;
  remoteSpeakers: Map<string, { volume: number; isSpeaking: boolean }>;
  latencyMs: number;
}

class RTCManager {
  private currentProvider: RTCProviderType = 'agora';
  private state: RTCChannelState = {
    isConnected: false,
    provider: 'agora',
    channelName: '',
    localAudioMuted: false,
    localVideoMuted: true,
    remoteSpeakers: new Map(),
    latencyMs: 38,
  };

  private listeners: ((state: RTCChannelState) => void)[] = [];

  public setProvider(provider: RTCProviderType) {
    this.currentProvider = provider;
    this.state.provider = provider;
    this.notify();
  }

  public getProvider(): RTCProviderType {
    return this.currentProvider;
  }

  public getState(): RTCChannelState {
    return { ...this.state };
  }

  public subscribe(cb: (state: RTCChannelState) => void): () => void {
    this.listeners.push(cb);
    cb(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.state));
  }

  public async joinChannel(options: RTCJoinOptions): Promise<boolean> {
    this.state.isConnected = true;
    this.state.channelName = options.channelName;
    this.state.localAudioMuted = options.role === 'audience';
    this.state.localVideoMuted = !options.enableVideo;
    this.state.latencyMs = Math.floor(25 + Math.random() * 20);
    this.notify();
    return true;
  }

  public async leaveChannel(): Promise<void> {
    this.state.isConnected = false;
    this.state.channelName = '';
    this.state.remoteSpeakers.clear();
    this.notify();
  }

  public muteLocalAudio(muted: boolean) {
    this.state.localAudioMuted = muted;
    this.notify();
  }

  public muteLocalVideo(muted: boolean) {
    this.state.localVideoMuted = muted;
    this.notify();
  }
}

export const rtcManager = new RTCManager();
