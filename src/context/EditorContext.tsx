import { createContext, SetStateAction, Dispatch } from "react";

export interface EditorContextType {
  zoom: number;
  height: number;
}

interface EditorStateType {
  editorContext: EditorContextType;
  setEditorContext: Dispatch<SetStateAction<EditorContextType>>;
}

const EditorContext = createContext<EditorStateType>({
  editorContext: {
    zoom: 1.0,
    height: 0,
  },
  setEditorContext: () => undefined,
});

export default EditorContext;
