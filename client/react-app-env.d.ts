/// <reference types="react-scripts" />

// src/react-app-env.d.ts or a new file like twitch.d.ts
interface Window {
  Twitch?: {
    Player: new (
      elementOrId: string | HTMLElement,
      options: {
        channel: string;
        width: string | number;
        height: string | number;
        muted?: boolean;
        parent?: string[];
        [key: string]: any;
      }
    ) => {
      destroy: () => void;
      [key: string]: any;
    };
  };
}
