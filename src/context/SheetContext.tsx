import { createContext } from "react";

interface SheetContextType {
  sheets: Sheet[];
  selectedSheet: number;
  selectedAnimation: number;
  setSelected(sheetInd: number, animInd: number): void;
}

const SheetContext = createContext<SheetContextType>({
  sheets: [],
  selectedSheet: -1,
  selectedAnimation: -1,
  setSelected: (_s, _a) => undefined,
});

export default SheetContext;
