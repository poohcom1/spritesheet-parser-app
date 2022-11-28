export function openFile(): Promise<File> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.click();

  return new Promise((res, rej) => {
    input.addEventListener("change", (e) => {
      const element = e.target as HTMLInputElement;
      if (element && element.files?.length) {
        res(element.files[0]);
      } else {
        rej();
      }
    });
  });
}

export function getBinaryImage(
  image: ImageData,
  bgColor: RGB = [0, 0, 0],
  replaceColor: RGB = [255, 255, 255]
): ImageData {
  // binary image data
  const bi = new ImageData(
    new Uint8ClampedArray(image.data),
    image.width,
    image.height
  );

  for (let i = 0; i < bi.data.length; i += 4) {
    if (
      bi.data[i] === bgColor[0] &&
      bi.data[i + 1] === bgColor[1] &&
      bi.data[i + 2] === bgColor[2]
    ) {
      bi.data[i] = replaceColor[0];
      bi.data[i + 1] = replaceColor[1];
      bi.data[i + 2] = replaceColor[2];
      bi.data[i + 3] = 255;
    } else {
      bi.data[i] = 0;
      bi.data[i + 1] = 0;
      bi.data[i + 2] = 0;
      bi.data[i + 3] = 255;
    }
  }

  return bi;
}

export async function getImageData(
  url: string,
  onFinish: () => void = () => null
): Promise<ImageData> {
  const image = new Image();
  image.src = url;

  return new Promise((res, rej) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        rej();
        return;
      }

      context.drawImage(image, 0, 0);
      onFinish();

      res(context.getImageData(0, 0, canvas.width, canvas.height));
    };

    image.onerror = (e) => {
      onFinish();
      rej(e);
    };
  });
}
