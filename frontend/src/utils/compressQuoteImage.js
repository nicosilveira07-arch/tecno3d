const MAX_INPUT_BYTES = 30 * 1024 * 1024;
const MAX_EDGE_PX = 1600;
const TARGET_MAX_BYTES = 1_200_000;
const HARD_MAX_BYTES = 2 * 1024 * 1024;
const SKIP_RECOMPRESS_BELOW = 900_000;

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          `No se pudo leer "${file.name}". Probá con JPG o PNG.`
        )
      );
    };

    image.src = url;
  });
}

async function decodeForCanvas(file) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(
        file
      );

      return { kind: "bitmap", value: bitmap };
    } catch {
      // fallback abajo
    }
  }

  const image = await loadImageElement(file);

  return { kind: "element", value: image };
}

function readDimensions(source) {
  if (source.kind === "bitmap") {
    return {
      width: source.value.width,
      height: source.value.height,
    };
  }

  return {
    width: source.value.naturalWidth,
    height: source.value.naturalHeight,
  };
}

function drawToCanvas(source, width, height) {
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", {
    alpha: false,
  });

  if (!context) {
    throw new Error(
      "El navegador no pudo procesar la imagen."
    );
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (source.kind === "bitmap") {
    context.drawImage(
      source.value,
      0,
      0,
      width,
      height
    );
    source.value.close?.();
  } else {
    context.drawImage(
      source.value,
      0,
      0,
      width,
      height
    );
  }

  return canvas;
}

function canvasToJpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "No se pudo comprimir la imagen."
            )
          );
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Reduce fotos antes de subirlas (más livianas = envío más rápido).
 */
export async function compressQuoteImage(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error(
      "Solo se permiten archivos de imagen."
    );
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(
      `"${file.name}" supera 30 MB. Elegí otra foto o recortala.`
    );
  }

  const source = await decodeForCanvas(file);
  const { width: srcW, height: srcH } =
    readDimensions(source);

  const longest = Math.max(srcW, srcH);
  const needsResize = longest > MAX_EDGE_PX;

  if (
    !needsResize &&
    file.size <= SKIP_RECOMPRESS_BELOW &&
    (file.type === "image/jpeg" ||
      file.type === "image/webp")
  ) {
    if (source.kind === "bitmap") {
      source.value.close?.();
    }

    return file;
  }

  const scale = needsResize
    ? MAX_EDGE_PX / longest
    : 1;

  const width = Math.max(
    1,
    Math.round(srcW * scale)
  );

  const height = Math.max(
    1,
    Math.round(srcH * scale)
  );

  const canvas = drawToCanvas(
    source,
    width,
    height
  );

  let quality = 0.8;
  let blob = await canvasToJpegBlob(
    canvas,
    quality
  );

  if (blob.size > TARGET_MAX_BYTES) {
    quality = 0.68;
    blob = await canvasToJpegBlob(
      canvas,
      quality
    );
  }

  if (
    blob.size > TARGET_MAX_BYTES &&
    quality > 0.55
  ) {
    quality = 0.55;
    blob = await canvasToJpegBlob(
      canvas,
      quality
    );
  }

  if (blob.size > HARD_MAX_BYTES) {
    throw new Error(
      `No se pudo optimizar "${file.name}" lo suficiente. Probá con otra foto.`
    );
  }

  const baseName =
    file.name.replace(/\.[^.]+$/, "") ||
    "imagen";

  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export function compressQuoteImages(files) {
  return Promise.all(
    files.map((file) =>
      compressQuoteImage(file)
    )
  );
}