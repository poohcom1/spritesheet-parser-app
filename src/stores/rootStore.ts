import create from "zustand";
import { combine } from "zustand/middleware";
import { Rect } from "blob-detection-ts";

const rootState = {
  sheets: [] as Sheet[],
  selectedSheet: -1,
  selectedAnimation: -1,
};

const rootStore = combine(rootState, (set, get) => ({
  getSheet(): Sheet | undefined {
    return get().sheets[get().selectedSheet];
  },
  getAnimation(): Sprites | undefined {
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

    sheet.animations.push({
      name: name || "Animation #" + sheet.animations.length,
      rects,
    });

    set({ sheets: [...get().sheets] });

    return true;
  },
}));

const useRootStore = create(rootStore);

export default useRootStore;
