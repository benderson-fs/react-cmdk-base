import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(__dirname, "../../src/themes/luz-palette.css"),
  "utf-8",
);

describe("themes/luz-palette.css — colors", () => {
  it("declares a top-level @theme block", () => {
    expect(css).toMatch(/^\s*@theme\s*\{/m);
  });

  it("registers the base-black color under --color-luz-base-black", () => {
    expect(css).toMatch(/--color-luz-base-black:\s*#000000/);
  });

  it("registers the product-purple-700 color (luz primary accent)", () => {
    expect(css).toMatch(/--color-luz-product-purple-700:\s*#4c2fff/);
  });

  it("registers all four product-red stops", () => {
    expect(css).toMatch(/--color-luz-product-red-100:\s*#fff7f9/);
    expect(css).toMatch(/--color-luz-product-red-400:\s*#c75e7e/);
    expect(css).toMatch(/--color-luz-product-red-500:\s*#d90034/);
    expect(css).toMatch(/--color-luz-product-red-700:\s*#b2002b/);
    expect(css).toMatch(/--color-luz-product-red-900:\s*#73001c/);
  });

  it("uses the luz- prefix consistently (no bare token names that would clash)", () => {
    // Catch a regression where someone declares --color-base-black inside @theme,
    // which would override Tailwind's defaults for consumer code.
    expect(css).not.toMatch(/--color-(?!luz-)[a-z]/);
  });

  it("does not declare CSS-only rule blocks (only @theme tokens)", () => {
    // Strip @theme {...} and verify nothing significant remains.
    const stripped = css
      .replace(/@theme\s*\{[\s\S]*?\n\}/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim();
    expect(stripped).toBe("");
  });
});
