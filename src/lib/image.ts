export function getBinaryImage(image: ImageData): ImageData {
  // binary image data
  const bi = new ImageData(
    new Uint8ClampedArray(image.data),
    image.width,
    image.height
  );

  for (let i = 0; i < bi.data.length; i += 4) {
    if (!(bi.data[i] !== 0 || bi.data[i + 1] !== 0 || bi.data[i + 2] !== 0)) {
      bi.data[i] = 255;
      bi.data[i + 1] = 255;
      bi.data[i + 2] = 255;
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

export async function getImageData(file: File): Promise<ImageData> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;

  return new Promise((res, rej) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext("2d");

      if (!context) {
        rej();
        return;
      }

      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);

      res(context.getImageData(0, 0, canvas.width, canvas.height));
    };

    image.onerror = (e) => {
      URL.revokeObjectURL(url);
      rej(e);
    };
  });
}
