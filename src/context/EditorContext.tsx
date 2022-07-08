import generateContext from "./context-factory";

const { Context, Provider } = generateContext({
  zoom: 0,
  height: 0,
});

export { Context as EditorContext, Provider as EditorProvider };
