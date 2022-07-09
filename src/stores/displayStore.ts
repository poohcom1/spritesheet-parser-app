import create from "zustand";
import { combine } from "zustand/middleware";

const displayState = {
  zoomInCallback: <() => void>(() => undefined),
  zoomOutCallback: <() => void>(() => undefined),
  height: 0,
};

const displayStore = combine(displayState, (set, get) => ({
  onZoom(onZoomIn: () => void, onZoomOut: () => void) {
    set({ zoomInCallback: onZoomIn, zoomOutCallback: onZoomOut });
  },
  zoomIn() {
    get().zoomInCallback();
  },
  zoomOut() {
    get().zoomOutCallback();
  },
  setHeight(height: number) {
    set({ height });
  },
}));

const useDisplayStore = create(displayStore);

export default useDisplayStore;
