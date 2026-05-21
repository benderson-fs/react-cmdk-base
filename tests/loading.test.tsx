import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Loading", () => {
  it("renders with role='progressbar' when `loading` is true", () => {
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
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveTextContent("Fetching…");
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
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "Fetching results",
    );
  });
});
