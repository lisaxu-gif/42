declare module "@mkkellogg/gaussian-splats-3d" {

  export enum RenderMode {
    Always = 0
  }

  export enum SceneRevealMode {
    Instant = 0
  }

  export enum LogLevel {
    None = 0
  }


  export class Viewer {

    constructor(options?: any);


    addSplatScene(
      path: string,
      options?: any
    ): Promise<void>;


    update(): void;


    render(): void;


    dispose(): void;
  }
}