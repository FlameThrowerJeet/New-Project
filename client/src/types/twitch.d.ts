// src/types/twitch.d.ts
declare global {
  interface Window {
    Twitch: {
      Player: {
        new (
          elementId: string,
          options: {
            width: string | number;
            height: string | number;
            channel?: string;
            video?: string;
            collection?: string;
            parent?: string[];
            muted?: boolean;
            autoplay?: boolean;
            [key: string]: any;
          }
        ): TwitchPlayer;
        READY: string;
        PLAY: string;
        PAUSE: string;
        ENDED: string;
        ONLINE: string;
        OFFLINE: string;
      };
      Embed: {
        new (
          elementId: string,
          options: {
            width: string | number;
            height: string | number;
            channel?: string;
            video?: string;
            collection?: string;
            parent?: string[];
            muted?: boolean;
            autoplay?: boolean;
            layout?: string;
            [key: string]: any;
          }
        ): TwitchEmbed;
        VIDEO_READY: string;
        VIDEO_PLAY: string;
        VIDEO_PAUSE: string;
      };
    };
  }
}

interface TwitchPlayer {
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setQuality: (quality: string) => void;
  getQualities: () => string[];
  getQuality: () => string;
  seek: (time: number) => void;
  addEventListener: (event: string, callback: Function) => void;
  removeEventListener: (event: string, callback: Function) => void;
  destroy: () => void;
}

interface TwitchEmbed {
  getPlayer: () => TwitchPlayer;
  addEventListener: (event: string, callback: Function) => void;
  removeEventListener: (event: string, callback: Function) => void;
}

export {};