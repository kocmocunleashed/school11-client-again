const compressedImageMaxSide = 1600;
const compressedImageQuality = 0.82;
const compressibleImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function renameAsWebp(fileName: string) {
  const trimmed = fileName.trim() || "upload";
  const base = trimmed.includes(".") ? trimmed.slice(0, trimmed.lastIndexOf(".")) : trimmed;
  return `${base || "upload"}.webp`;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });
}

export async function compressImageToWebp(file: File) {
  if (file.type === "image/gif") {
    throw new Error("GIF uploads are not supported. Please upload a JPG, PNG, or WebP image.");
  }
  if (!compressibleImageTypes.has(file.type)) return file;

  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) throw new Error("Could not read image dimensions");

  const scale = Math.min(1, compressedImageMaxSide / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image compression is not supported in this browser");
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", compressedImageQuality));
  if (!blob || blob.type !== "image/webp") {
    throw new Error("WebP compression is not supported in this browser");
  }

  return new File([blob], renameAsWebp(file.name), { type: "image/webp", lastModified: Date.now() });
}
