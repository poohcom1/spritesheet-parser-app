import create from "zustand";
import { combine } from "zustand/middleware";

const displayState = {
  zoom: 0,
  height: 0,
};

const displayStore = combine(displayState, (set, get) => ({
  setZoom(zoom: number) {
    set({ zoom });
  },
  zoomIn() {
    set({ zoom: get().zoom + 1 });
  },
  zoomOut() {
    set({ zoom: get().zoom - 1 });
  },
  setHeight(height: number) {
    set({ height });
  },
}));

const useDisplayStore = create(displayStore);

export default useDisplayStore;
