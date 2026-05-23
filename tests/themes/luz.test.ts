import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(__dirname, "../../src/themes/luz.css"),
  "utf-8",
);

describe("themes/luz.css — CommandMenu surface", () => {
  it("includes a luz override block for .cmdk-popup", () => {
    expect(css).toMatch(
      /\[data-theme=["']luz["']\][^{]*\.cmdk-popup[^{]*\{/,
    );
  });

  it("sets --cmdk-bg to luz base-black", () => {
    expect(css).toMatch(/--cmdk-bg:\s*#000000/);
  });

  it("sets --cmdk-accent-bg to luz base-black-800", () => {
    expect(css).toMatch(/--cmdk-accent-bg:\s*#222126/);
  });

  it("sets --cmdk-radius to 20px", () => {
    expect(css).toMatch(/--cmdk-radius:\s*20px/);
  });

  it("covers ancestor, self, and combined selectors for .cmdk-popup", () => {
    // ancestor: [data-theme="luz"] .cmdk-popup
    expect(css).toMatch(/\[data-theme=["']luz["']\]\s+\.cmdk-popup/);
    // self: .cmdk-popup[data-theme="luz"]  (for portaled surfaces set directly)
    expect(css).toMatch(/\.cmdk-popup\[data-theme=["']luz["']\]/);
  });
});

describe("themes/luz.css — PromptInput root surface", () => {
  it("includes a luz override block for .pi-root", () => {
    expect(css).toMatch(/\.pi-root\[data-theme=["']luz["']\]/);
  });

  it("sets --pi-accent (submit bg) to luz base-black in light mode", () => {
    // The first .pi-root block (default/light) sets --pi-accent: #000000
    const lightBlock = css.match(
      /\[data-theme=["']luz["']\][^{]*\.pi-root[\s\S]*?\}/,
    );
    expect(lightBlock?.[0]).toContain("--pi-accent: #000000");
  });

  it("sets --pi-focus-ring to luz stroke-shadow rgba", () => {
    expect(css).toMatch(
      /--pi-focus-ring:\s*rgba\(76,\s*47,\s*255,\s*0\.2\)/,
    );
  });

  it("sets --pi-radius to 20px (luz radius-toolbar)", () => {
    expect(css).toMatch(/--pi-radius:\s*20px/);
  });

  it("includes a .dark override for .pi-root under luz", () => {
    // Selector shape: :where(.dark) [data-theme="luz"] .pi-root, etc.
    expect(css).toMatch(
      /:where\(\.dark\)\s*\[data-theme=["']luz["']\][^{]*\.pi-root/,
    );
  });

  it("dark override inverts --pi-accent to base-white", () => {
    const darkBlock = css.match(
      /:where\(\.dark\)\s*\[data-theme=["']luz["']\][^{]*\.pi-root[\s\S]*?\}/,
    );
    expect(darkBlock?.[0]).toContain("--pi-accent: #ffffff");
  });
});

describe("themes/luz.css — PromptInput portaled surfaces", () => {
  it("includes a luz override block for .pi-menu-popup", () => {
    expect(css).toMatch(
      /\[data-theme=["']luz["']\][^{]*\.pi-menu-popup/,
    );
  });

  it("sets --pi-menu-bg to luz base-white in light mode", () => {
    const block = css.match(
      /\[data-theme=["']luz["']\][^{]*\.pi-menu-popup[\s\S]*?\}/,
    );
    expect(block?.[0]).toContain("--pi-menu-bg: #ffffff");
  });

  it("includes a .dark override for .pi-menu-popup under luz", () => {
    expect(css).toMatch(
      /:where\(\.dark\)\s*\[data-theme=["']luz["']\][^{]*\.pi-menu-popup/,
    );
  });

  it("includes a luz override block for .pi-tooltip with always-dark values", () => {
    const block = css.match(
      /\[data-theme=["']luz["']\][^{]*\.pi-tooltip[\s\S]*?\}/,
    );
    expect(block?.[0]).toContain("--pi-tooltip-bg: #000000");
    expect(block?.[0]).toContain("--pi-tooltip-fg: #ffffff");
  });
});
