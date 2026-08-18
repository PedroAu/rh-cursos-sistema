export interface ImageSize {
  width: number;
  height: number;
  type?: string;
}

export function imageSize(input: Uint8Array | ArrayBuffer): ImageSize;
