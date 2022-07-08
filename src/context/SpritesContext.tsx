import generateContext from "./context-factory";

const { Context, Provider } = generateContext({
  sheets: [] as Sheet[],
  selectedSheet: -1,
  selectedAnimation: -1,
});

export { Context as SpritesContext, Provider as SpritesProvider };
