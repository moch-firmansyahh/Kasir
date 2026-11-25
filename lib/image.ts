export const MAX_IMAGE_SIDE_PX = 800;
export const JPEG_QUALITY = 0.6;

/**
 * Calculates target dimensions preserving aspect ratio within maxSide.
 */
export function calculateScaledDimensions(
  width: number,
  height: number,
  maxSide: number = MAX_IMAGE_SIDE_PX
): { width: number; height: number } {
  if (width <= 0 || height <= 0) {
    return { width: maxSide, height: maxSide };
  }
  const longest = Math.max(width, height);
  if (longest <= maxSide) {
    return { width, height };
  }
  const scale = maxSide / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal membaca file gambar."));
    };
    img.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal mengompres gambar."));
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
 * Compresses a selected/captured image on the client to JPEG <= 1280px.
 */
export async function compressImageFile(file: File): Promise<File> {
  const img = await loadImageElement(file);
  const { width, height } = calculateScaledDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Browser tidak mendukung pemrosesan gambar.");
  }

  ctx.drawImage(img, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, JPEG_QUALITY);

  return new File([blob], "proof.jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
