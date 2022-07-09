import create from "zustand";
import { combine } from "zustand/middleware";
import { Rect } from "blob-detection-ts";
import { alignFramesVertically, orderRects } from "lib/blob-detection";

const rootState = {
  sheets: [] as Sheet[],
  selectedSheet: -1,
  selectedAnimation: -1,
};

const rootStore = combine(rootState, (set, get) => ({
  getSheet(): Sheet | undefined {
    return get().sheets[get().selectedSheet];
  },
  getAnimation(): Frames | undefined {
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
      position: r,
      offset: new Rect(0, 0, 0, 0),
    }));

    alignFramesVertically(frames);

    sheet.animations.push({
      name: name || "Animation #" + sheet.animations.length,
      frames,
      padding: { x: 0, y: 0 },

      display: {
        zoom: 0,
      },
    });

    set({ sheets: [...get().sheets] });

    return true;
  },

  editAnimation(update: Partial<Frames>): boolean {
    const sheet: Sheet | undefined = get().sheets[get().selectedSheet];
    if (!sheet) return false;
    const anim = sheet.animations[get().selectedAnimation];
    if (!anim) return false;

    sheet.animations[get().selectedAnimation] = { ...anim, ...update };

    set({ sheets: get().sheets });

    return true;
  },

  // Specific display control
  setAnimationDisplay(display: Partial<FramesDisplay>): boolean {
    const sheet: Sheet | undefined = get().sheets[get().selectedSheet];
    if (!sheet) return false;
    const anim = sheet.animations[get().selectedAnimation];
    if (!anim) return false;

    anim.display = { ...anim.display, ...display };
    set({ sheets: get().sheets });

    return true;
  },
}));

const useRootStore = create(rootStore);

export default useRootStore;
