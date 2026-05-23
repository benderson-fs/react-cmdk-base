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
