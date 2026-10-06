import {
  COMPRESSED_JPEG_QUALITY,
  COMPRESSED_MAX_DIMENSION,
  MAX_IMAGE_FILE_BYTES,
} from "../constants";
import {
  PRODUCT_IMAGE_INVALID_TYPE,
  PRODUCT_IMAGE_TOO_LARGE,
} from "../labels";

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = src;
  });
}

function fitWithin(
  width: number,
  height: number,
  max: number
): { width: number; height: number } {
  if (width <= max && height <= max) return { width, height };
  const ratio = width > height ? max / width : max / height;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return PRODUCT_IMAGE_INVALID_TYPE;
  if (file.size > MAX_IMAGE_FILE_BYTES) return PRODUCT_IMAGE_TOO_LARGE;
  return null;
}

export async function compressImage(file: File): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);
  const { width, height } = fitWithin(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    COMPRESSED_MAX_DIMENSION
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image processing not supported in this browser.");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", COMPRESSED_JPEG_QUALITY);
}