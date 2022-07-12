import create from "zustand";
import { combine } from "zustand/middleware";
import { Rect } from "blob-detection-ts";
import { alignFramesVertically, getFramesSize, orderRects } from "lib/sprites";
import { SetStateAction } from "react";

const rootState = {
  sheets: [] as Sheet[],
  selectedSheet: -1,
  selectedAnimation: -1,
};

const rootStore = combine(rootState, (set, get) => ({
  getSheet(): Sheet | undefined {
    return get().sheets[get().selectedSheet];
  },
  getAnimation(): Anim | undefined {
    return get().sheets[get().selectedSheet]?.animations[
      get().selectedAnimation
    ];
  },
  selectSheet(ind: number) {
    set({ selectedSheet: ind, selectedAnimation: -1 });
  },
  selectAnimation(sheetInd: number, animInd: number) {
    set({ selectedSheet: sheetInd, selectedAnimation: animInd });
  },
  addSheet(sheet: Sheet, autoSelect = true) {
    const ind = autoSelect ? get().sheets.length : get().selectedSheet;
    const sheets = [...get().sheets, sheet];

    set({
      sheets,
      selectedSheet: ind,
    });
  },
  addAnimation(rects: Rect[], name = ""): boolean {
    const sheet: Sheet | undefined = get().sheets[get().selectedSheet];

    if (!sheet) return false;

    orderRects(rects);
    const frames = rects.map((r) => ({
      view: r,
      offset: { x: 0, y: 0 },
    }));

    alignFramesVertically(frames);

    sheet.animations.push({
      name: name || "Animation #" + sheet.animations.length,
      frames,
      padding: { x: 5, y: 5 },
      size: getFramesSize(frames),

      editor: {
        zoom: 0,
        fps: 12,
        playing: true,
        frameNo: 0,
      },
    });

    set({ sheets: [...get().sheets] });

    return true;
  },

  updateAnimation(update: SetStateAction<Partial<Anim>>): boolean {
    const sheet: Sheet | undefined = get().sheets[get().selectedSheet];
    if (!sheet) return false;
    const anim = sheet.animations[get().selectedAnimation];
    if (!anim) return false;

    sheet.animations[get().selectedAnimation] = resolveState(anim, update);

    set({ sheets: get().sheets });

    return true;
  },

  updateFrame(update: SetStateAction<Partial<Frame>>): boolean {
    const sheet: Sheet | undefined = get().sheets[get().selectedSheet];
    if (!sheet) return false;
    const anim = sheet.animations[get().selectedAnimation];
    if (!anim) return false;
    const frame = anim.frames[anim.editor.frameNo];
    if (!frame) return false;

    anim.frames[anim.editor.frameNo] = resolveState(frame, update);

    set({ sheets: get().sheets });

    return true;
  },

  // Specific display control
  setAnimationEditor(editor: SetStateAction<Partial<FramesEditor>>): boolean {
    const sheet: Sheet | undefined = get().sheets[get().selectedSheet];
    if (!sheet) return false;
    const anim = sheet.animations[get().selectedAnimation];
    if (!anim) return false;

    anim.editor = resolveState(anim.editor, editor);
    set({ sheets: get().sheets });

    return true;
  },
}));

const useRootStore = create(rootStore);

export default useRootStore;

// Helper function

function resolveState<T>(state: T, setState: SetStateAction<Partial<T>>): T {
  return {
    ...state,
    ...(typeof setState === "function" ? setState(state) : setState),
  };
}
