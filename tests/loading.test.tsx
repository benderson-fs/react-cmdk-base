import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Loading", () => {
  it("renders a labeled status div when `loading` is true", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Loading loading>Fetching…</CommandMenu.Loading>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    // No role="progressbar" — Loading lives inside the listbox where only
    // option/group/separator are valid per WAI-ARIA. Locate by data-slot.
    const bar = document.querySelector(
      '[data-slot="command-menu-loading"]',
    ) as HTMLElement | null;
    expect(bar).not.toBeNull();
    expect(bar).toHaveTextContent("Fetching…");
    expect(bar).toHaveAttribute("aria-label", "Loading");
  });

  it("does not render when `loading` is false", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Loading loading={false}>Idle</CommandMenu.Loading>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    expect(screen.queryByText("Idle")).toBeNull();
  });

  it("exposes `aria-label` when provided", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Loading loading label="Fetching results">
              …
            </CommandMenu.Loading>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    const bar = document.querySelector(
      '[data-slot="command-menu-loading"]',
    ) as HTMLElement | null;
    expect(bar).not.toBeNull();
    expect(bar).toHaveAttribute("aria-label", "Fetching results");
  });
});
