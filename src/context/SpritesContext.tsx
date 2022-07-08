import generateContext from "./context-factory";

const { Context, Provider } = generateContext({
  sheets: [] as Sheet[],
  selectedSheet: -1,
  selectedAnimation: -1,

  getSheet() {
    return this.sheets[this.selectedSheet];
  },
  getAnimation() {
    return this.sheets[this.selectedSheet].animations[this.selectedAnimation];
  },
});

export { Context as SpritesContext, Provider as SpritesProvider };
