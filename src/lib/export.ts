import { getImageCanvas } from "./canvas";

export function download(url: string, name: string) {
  const a = document.createElement("a");

  a.href = url;
  a.setAttribute("download", name);
  a.click();
}

const SPRITESHEET_OPTIONS = {
  rows: 1,
};

export function removeExtension(name: string): string {
  const tokens = name.split(".");

  return tokens.slice(0, tokens.length - 1).join("");
}

export function framesToSpritesheet(
  animation: Anim,
  image: ImageData,
  options = SPRITESHEET_OPTIONS
): string {
  const originalImage = getImageCanvas(image);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "[framesToSpritesheet] Canvas context is undefined or null"
    );
  }

  const rows = options.rows;
  const columns = animation.frames.length / rows;

  canvas.width = animation.size.width * columns;
  canvas.height = animation.size.height * rows;

  let i = 0;
  outer: for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (i >= animation.frames.length) break outer;

      const x = c * animation.size.width;
      const y = r * animation.size.height;

      const f = animation.frames[i++];

      ctx.drawImage(
        originalImage,
        f.view.x,
        f.view.y,
        f.view.width,
        f.view.height,
        f.offset.x + x,
        f.offset.y + y,
        f.view.width,
        f.view.height
      );
    }
  }

  return canvas.toDataURL();
}
