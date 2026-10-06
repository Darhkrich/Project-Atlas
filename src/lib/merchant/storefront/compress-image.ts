export interface CompressImageOptions {
  maxWidth: number;
  maxHeight: number;
  maxBytes: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg" | "image/png";
}

export interface CompressImageResult {
  dataUrl: string;
  bytes: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the image."));
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read the file."));
    };
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

function fitInside(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function dataUrlBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) return dataUrl.length;
  return dataUrl.length - commaIndex - 1;
}

export async function compressImage(
  file: File,
  options: CompressImageOptions
): Promise<CompressImageResult> {
  const originalDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(originalDataUrl);

  const target = fitInside(
    img.naturalWidth,
    img.naturalHeight,
    options.maxWidth,
    options.maxHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");

  ctx.drawImage(img, 0, 0, target.width, target.height);

  const format = options.format ?? "image/webp";
  const startQuality = options.quality ?? 0.85;

  let quality = startQuality;
  let dataUrl = canvas.toDataURL(format, quality);

  while (dataUrlBytes(dataUrl) > options.maxBytes && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL(format, quality);
  }

  if (dataUrlBytes(dataUrl) > options.maxBytes) {
    const fallback = canvas.toDataURL("image/jpeg", 0.75);
    if (dataUrlBytes(fallback) < dataUrlBytes(dataUrl)) {
      dataUrl = fallback;
    }
  }

  return {
    dataUrl,
    bytes: dataUrlBytes(dataUrl),
    width: target.width,
    height: target.height,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}