import { expose } from "comlink";
import { blobDetection } from "lib/blob-detection";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
  ...a: Parameters<T>
) => TNewReturn;

export interface RawRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const worker = {
  blobDetection: blobDetection as ReplaceReturnType<
    typeof blobDetection,
    RawRect[]
  >,
};

export type BlobDetectionWorker = typeof worker;

expose(worker);
