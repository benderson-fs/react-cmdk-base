import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommandMenuRoot } from "../src";

describe("CommandMenu dialog a11y", () => {
  it("has a Title (named region) and a Description without redundant aria-label", () => {
    render(<CommandMenuRoot open onOpenChange={() => {}}>x</CommandMenuRoot>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toHaveAttribute("aria-label");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });
});
