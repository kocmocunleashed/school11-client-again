import { expect, test } from "bun:test";
import { publicImagePatterns, unoptimizedPublicImage } from "../src/lib/image-policy";

const project = "https://school.example.supabase.co";
test("local and approved public images use resizing", () => {
  for (const src of ["/school-bg.jpg", "https://i.ytimg.com/vi/abc/hqdefault.jpg", "https://www.famhall.school11.edu.mn/image/ouom/test.jpg", `${project}/storage/v1/object/public/news/photo.webp`]) {
    expect(unoptimizedPublicImage(src, project)).toBe(false);
  }
});
test("unknown origins, private paths, SVG/GIF and browser-local previews remain direct", () => {
  for (const src of ["https://another.example/image.jpg", `${project}/storage/v1/object/sign/news/photo.jpg`, "https://i.ytimg.com.evil.example/vi/x.jpg", "//i.ytimg.com/vi/x.jpg", "data:image/webp;base64,aaa", "blob:http://localhost:3000/photo", "/animated.gif", "/logo.svg", "https://user:pass@i.ytimg.com/vi/x.jpg"]) {
    expect(unoptimizedPublicImage(src, project)).toBe(true);
  }
});
test("Next config uses the same narrow patterns and tolerates absent configuration", () => {
  expect(publicImagePatterns(project).at(-1)?.hostname).toBe("school.example.supabase.co");
  expect(publicImagePatterns()).not.toContainEqual({ protocol: "https", hostname: "**" });
  expect(publicImagePatterns("broken").length).toBe(2);
  expect(publicImagePatterns("http://localhost:1234").length).toBe(2);
});
