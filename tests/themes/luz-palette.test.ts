import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
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

describe("themes/luz-palette.css — radii", () => {
  it("registers the luz toolbar radius (20px)", () => {
    expect(css).toMatch(/--radius-luz-toolbar:\s*20px/);
  });

  it("registers the luz button radius (4px)", () => {
    expect(css).toMatch(/--radius-luz-button:\s*4px/);
  });

  it("registers all numbered radius stops", () => {
    expect(css).toMatch(/--radius-luz-1:\s*5px/);
    expect(css).toMatch(/--radius-luz-2:\s*10px/);
    expect(css).toMatch(/--radius-luz-3:\s*20px/);
  });
});

describe("themes/luz-palette.css — shadows", () => {
  it("registers the luz heavy shadow (6-stop)", () => {
    expect(css).toMatch(/--shadow-luz-heavy:[^;]*0\.11\)[^;]*0\.08\)/);
  });

  it("registers the luz button-secondary shadow (4-stop)", () => {
    expect(css).toMatch(/--shadow-luz-button-secondary:[^;]*0\.1\)[^;]*0\.09\)/);
  });

  it("registers the luz focus shadow with product-purple-700 base color", () => {
    expect(css).toMatch(/--shadow-luz-focus:\s*0\s+0\s+0\s+2px\s+rgba\(76,\s*47,\s*255,\s*0\.2\)/);
  });
});

describe("themes/luz-palette.css — easing", () => {
  it("registers the luz button-action easing curve", () => {
    expect(css).toMatch(
      /--ease-luz-button-action:\s*cubic-bezier\(0\.4,\s*1\.8,\s*0\.6,\s*1\)/,
    );
  });
});

describe("themes/luz-palette.css — namespace hygiene", () => {
  it("does not include excluded namespaces (font, spacing, breakpoint, animate)", () => {
    expect(css).not.toMatch(/--font-luz-/);
    expect(css).not.toMatch(/--spacing-luz-/);
    expect(css).not.toMatch(/--breakpoint-luz-/);
    expect(css).not.toMatch(/--animate-luz-/);
  });
});

describe("themes/luz-palette.css — Tailwind compile integration", () => {
  // ~2-3s test (one tailwindcss invocation). Mark as slow.
  it("generates utility classes for referenced luz tokens", { timeout: 30_000 }, () => {
    const dir = mkdtempSync(join(tmpdir(), "luz-palette-test-"));
    try {
      const paletteAbs = resolve(__dirname, "../../src/themes/luz-palette.css");
      writeFileSync(
        join(dir, "in.css"),
        `@import "tailwindcss";\n@import "${paletteAbs}";\n`,
      );
      // Fixture references one color utility, one radius utility, one shadow utility, one easing utility.
      writeFileSync(
        join(dir, "fixture.html"),
        `<div class="bg-luz-product-purple-700 text-luz-base-white rounded-luz-toolbar shadow-luz-heavy ease-luz-button-action"></div>`,
      );
      const repoRoot = resolve(__dirname, "../..");
      const out = execSync(
        `pnpm exec tailwindcss -i ${JSON.stringify(join(dir, "in.css"))} --content ${JSON.stringify(join(dir, "fixture.html"))}`,
        { cwd: repoRoot, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
      );

      // Each referenced token must produce its utility in the output.
      expect(out).toMatch(/\.bg-luz-product-purple-700\s*\{/);
      expect(out).toMatch(/\.text-luz-base-white\s*\{/);
      expect(out).toMatch(/\.rounded-luz-toolbar\s*\{/);
      expect(out).toMatch(/\.shadow-luz-heavy\s*\{/);
      expect(out).toMatch(/\.ease-luz-button-action\s*\{/);

      // Resolved values must appear inline (color, radius value).
      expect(out).toContain("#4c2fff");
      expect(out).toContain("20px");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does NOT generate utilities for tokens that aren't referenced", { timeout: 30_000 }, () => {
    const dir = mkdtempSync(join(tmpdir(), "luz-palette-test-"));
    try {
      const paletteAbs = resolve(__dirname, "../../src/themes/luz-palette.css");
      writeFileSync(
        join(dir, "in.css"),
        `@import "tailwindcss";\n@import "${paletteAbs}";\n`,
      );
      writeFileSync(
        join(dir, "fixture.html"),
        `<div class="bg-luz-base-black text-luz-base-white"></div>`,
      );
      const repoRoot = resolve(__dirname, "../..");
      const out = execSync(
        `pnpm exec tailwindcss -i ${JSON.stringify(join(dir, "in.css"))} --content ${JSON.stringify(join(dir, "fixture.html"))}`,
        { cwd: repoRoot, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
      );

      // Referenced tokens ARE in output.
      expect(out).toMatch(/\.bg-luz-base-black\s*\{/);
      expect(out).toMatch(/\.text-luz-base-white\s*\{/);
      // Unreferenced tokens are NOT.
      expect(out).not.toMatch(/\.bg-luz-product-pink-500/);
      expect(out).not.toMatch(/\.rounded-luz-spotlight/);
      expect(out).not.toMatch(/\.text-luz-product-red-500/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
