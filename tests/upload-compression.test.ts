import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { compressImageToWebp } from "../src/lib/admin/upload";

const originalImage = Object.getOwnPropertyDescriptor(globalThis, "Image");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const mocks: Array<{ mockRestore(): void }> = [];

afterEach(() => {
  for (const mock of mocks.splice(0)) mock.mockRestore();
  for (const [key, descriptor] of [["Image", originalImage], ["document", originalDocument]] as const) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

function browser({ width = 2400, height = 1600, encodedSize = 500, encodedType = "image/webp", contextAvailable = true, encoderThrows = false } = {}) {
  const dimensions: number[][] = [];
  const context = { imageSmoothingEnabled: false, imageSmoothingQuality: "low", drawImage: () => {} };
  const canvas = {
    width: 0, height: 0,
    getContext: () => contextAvailable ? context : null,
    toBlob(callback: (blob: Blob | null) => void) {
      dimensions.push([canvas.width, canvas.height]);
      if (encoderThrows) throw new Error("Encoder unavailable");
      callback(new Blob([new Uint8Array(encodedSize)], { type: encodedType }));
    },
  };
  Object.defineProperty(globalThis, "Image", { configurable: true, value: class {
    naturalWidth = width; naturalHeight = height;
    onload = () => {};
    set src(_value: string) { queueMicrotask(() => this.onload()); }
  } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => canvas } });
  mocks.push(spyOn(URL, "createObjectURL").mockReturnValue("blob:test"), spyOn(URL, "revokeObjectURL").mockImplementation(() => {}));
  return { dimensions, canvas, context };
}

const photo = () => new File([new Uint8Array(4000)], "photo.jpg", { type: "image/jpeg", lastModified: 1234 });

describe("image upload optimization", () => {
  test("uses smaller WebP with a portrait-appropriate size and keeps aspect ratio", async () => {
    const { dimensions, canvas, context } = browser();
    const output = await compressImageToWebp(photo(), "portrait");
    expect(output.type).toBe("image/webp");
    expect(output.name).toBe("photo.webp");
    expect(output.size).toBe(500);
    expect(output.lastModified).toBe(1234);
    expect(dimensions).toEqual([[800, 533]]);
    expect(context.imageSmoothingQuality).toBe("high");
    expect(canvas.width).toBe(0);
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
  test("keeps hero images sharp on large displays", async () => {
    const { dimensions } = browser({ width: 4000, height: 2400 });
    await compressImageToWebp(photo(), "hero");
    expect(dimensions).toEqual([[2560, 1536]]);
  });
  test("never upscales a small image", async () => {
    const { dimensions } = browser({ width: 160, height: 100 });
    await compressImageToWebp(photo());
    expect(dimensions).toEqual([[160, 100]]);
  });
  test("large hero encodings fall back to the previously supported image dimensions", async () => {
    const { dimensions } = browser({ width: 4000, height: 2400, encodedSize: 4_500_000 });
    await compressImageToWebp(new File([new Uint8Array(6_000_000)], "large.jpg", { type: "image/jpeg" }), "hero");
    expect(dimensions).toEqual([[2560, 1536], [1600, 960]]);
  });
  test("oversized logos can still use compression to fit the upload limit", async () => {
    const { dimensions } = browser();
    const output = await compressImageToWebp(new File([new Uint8Array(6_000_000)], "large-logo.png", { type: "image/png" }), "logo");
    expect(output.size).toBe(500);
    expect(dimensions).toEqual([[1600, 1067]]);
  });
  test("keeps the original when encoding makes it larger", async () => {
    browser({ encodedSize: 5000 });
    const input = photo();
    expect(await compressImageToWebp(input)).toBe(input);
  });
  test("lets supported original uploads proceed when WebP is unavailable", async () => {
    browser({ encodedType: "image/png" });
    const input = photo();
    expect(await compressImageToWebp(input)).toBe(input);
  });
  test("lets uploads proceed when the canvas is unavailable", async () => {
    browser({ contextAvailable: false });
    const input = photo();
    expect(await compressImageToWebp(input)).toBe(input);
  });
  test("lets uploads proceed when the encoder throws", async () => {
    browser({ encoderThrows: true });
    const input = photo();
    expect(await compressImageToWebp(input)).toBe(input);
  });
  test("preserves original PDFs and logos without decoding or changing bytes", async () => {
    const pdf = new File(["%PDF-1.7"], "guide.pdf", { type: "application/pdf" });
    expect(await compressImageToWebp(pdf)).toBe(pdf);
    const logo = new File([new Uint8Array(20)], "logo.png", { type: "image/png" });
    expect(await compressImageToWebp(logo, "logo")).toBe(logo);
  });
  test("does not recompress a suitably sized WebP", async () => {
    const { dimensions } = browser({ width: 600, height: 400 });
    const input = new File([new Uint8Array(4000)], "photo.webp", { type: "image/webp" });
    expect(await compressImageToWebp(input)).toBe(input);
    expect(dimensions).toEqual([]);
  });
  test("preserves animated WebP", async () => {
    const bytes = new Uint8Array(21);
    bytes.set(new TextEncoder().encode("VP8X"), 12); bytes[20] = 2;
    const input = new File([bytes], "animated.webp", { type: "image/webp" });
    expect(await compressImageToWebp(input)).toBe(input);
  });
  test("retains the existing unsupported GIF validation", async () => {
    await expect(compressImageToWebp(new File(["GIF89a"], "file.gif", { type: "image/gif" }))).rejects.toThrow("GIF uploads are not supported");
  });
});
