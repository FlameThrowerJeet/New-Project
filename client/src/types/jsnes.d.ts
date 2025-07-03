declare module 'jsnes' {
  export default class jsNES {
    constructor(config: {
      onFrame: (frameBuffer: number[]) => void;
      onAudioSample: (left: number, right: number) => void;
    });

    loadROM(romData: Uint8Array): void;
    start(): void;
    stop(): void;
    frame(): void;
    reset(): void;
    buttonDown(player: number, button: number): void;
    buttonUp(player: number, button: number): void;
    toJSON(): any;
    fromJSON(state: any): void;

    static BUTTON_A: number;
    static BUTTON_B: number;
    static BUTTON_SELECT: number;
    static BUTTON_START: number;
    static BUTTON_UP: number;
    static BUTTON_DOWN: number;
    static BUTTON_LEFT: number;
    static BUTTON_RIGHT: number;
  }
} 