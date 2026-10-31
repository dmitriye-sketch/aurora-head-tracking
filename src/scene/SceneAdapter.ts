export interface ViewOffset {
  x: number;
  y: number;
}

export interface SceneAdapter {
  setView(offset: ViewOffset, intensity: number): void;
  resize(width: number, height: number): void;
  render(): void;
  dispose(): void;
}
