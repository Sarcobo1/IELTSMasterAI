// import { FaceMesh } from '@mediapipe/face_mesh/face_mesh';
// import { Hands } from '@mediapipe/hands/hands';
// import { Camera } from '@mediapipe/camera_utils/camera_utils';

// declare module '@mediapipe/face_mesh/face_mesh' {
//   export class FaceMesh {
//     constructor(options: any);
//     setOptions(options: any): void;
//     send(input: any): Promise<void>;
//     onResults(callback: (results: any) => void): void;
//   }
// }

// declare module '@mediapipe/hands/hands' {
//   export class Hands {
//     constructor(options: any);
//     setOptions(options: any): void;
//     send(input: any): Promise<void>;
//     onResults(callback: (results: any) => void): void;
//   }
// }

// declare module '@mediapipe/camera_utils/camera_utils' {
//   export class Camera {
//     constructor(video: HTMLVideoElement, options: { onFrame: () => void; width?: number; height?: number });
//     start(): void;
//     stop(): void;
//   }
// }