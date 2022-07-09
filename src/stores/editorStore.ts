import create from "zustand";
import { combine } from "zustand/middleware";

const editorState = {
  zoomInCallback: <() => void>(() => undefined),
  zoomOutCallback: <() => void>(() => undefined),
  height: 0,
};

const editorStore = combine(editorState, (set, get) => ({
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

const useEditorStore = create(editorStore);

export default useEditorStore;
