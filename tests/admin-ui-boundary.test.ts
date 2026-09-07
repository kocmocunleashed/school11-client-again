import { describe, expect, test } from "bun:test";

describe("admin UI boundary", () => {
  test("does not mutate Next-managed metadata from client components", async () => {
    const source = await Bun.file("src/components/admin/admin-app.tsx").text();

    expect(source).not.toContain("document.head.appendChild");
    expect(source).not.toContain("meta[name='robots']");
  });
});
