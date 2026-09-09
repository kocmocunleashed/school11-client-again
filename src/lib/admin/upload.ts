export type ImageUploadKind = "image" | "portrait" | "hero" | "logo";
const compressedImageMaxSide = { image: 1600, portrait: 800, hero: 2560, logo: 1600 } as const;
const compressedImageQuality = 0.88;
// Leave room for multipart overhead below Vercel's 4.5 MB request limit.
const comfortableUploadBytes = 4 * 1024 * 1024;
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

export async function compressImageToWebp(file: File, kind: ImageUploadKind = "image") {
  if (file.type === "image/gif") {
    throw new Error("GIF uploads are not supported. Please upload a JPG, PNG, or WebP image.");
  }
  if (!compressibleImageTypes.has(file.type)) return file;
  // Keep normal logos pixel-exact. Oversized ones still use the existing
  // resize/compress path so a large logo can be uploaded as before.
  if (kind === "logo" && file.size <= comfortableUploadBytes) return file;
  if (file.type === "image/webp") {
    const header = new Uint8Array(await file.slice(0, 21).arrayBuffer());
    // VP8X's animation bit: never flatten an animated WebP into its first frame.
    if (String.fromCharCode(...header.slice(12, 16)) === "VP8X" && ((header[20] || 0) & 2)) return file;
  }

  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) throw new Error("Could not read image dimensions");

  const scale = Math.min(1, compressedImageMaxSide[kind] / Math.max(sourceWidth, sourceHeight));
  // Avoid generation loss when an existing WebP already fits its display size.
  if (file.type === "image/webp" && scale === 1 && file.size <= comfortableUploadBytes) return file;
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  try {
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    const encode = () => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", compressedImageQuality));
    let blob = await encode();
    if (blob && blob.size > comfortableUploadBytes && Math.max(width, height) > 1600) {
      // Exceptionally detailed hero photos may exceed the request limit even
      // as WebP. Fall back to the previously supported 1600px size in that case.
      const smallerScale = 1600 / Math.max(width, height);
      canvas.width = Math.max(1, Math.round(width * smallerScale));
      canvas.height = Math.max(1, Math.round(height * smallerScale));
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      blob = await encode();
    }
    // Unsupported browsers may return PNG. Keep the valid original in that
    // case, or if re-encoding would actually make the upload larger.
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    return new File([blob], renameAsWebp(file.name), { type: "image/webp", lastModified: file.lastModified });
  } catch {
    // Compression is an optimization, not a prerequisite for uploading.
    return file;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
