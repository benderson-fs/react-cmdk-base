import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput result parts", () => {
  it("renders Group heading, Empty, Loading, Separator inside Results", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Group heading="Docs">
              <SearchInput.Item value="one">One</SearchInput.Item>
            </SearchInput.Group>
            <SearchInput.Separator />
            <SearchInput.Loading label="Loading" />
            <SearchInput.Empty alwaysRender>Nothing here</SearchInput.Empty>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "x" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByText("Docs")).toBeInTheDocument();
    // Loading does NOT use role="progressbar" because it lives inside the
    // listbox where only option/group/separator are valid. We assert the
    // data-slot + aria-label instead.
    const loading = document.querySelector(
      '[data-slot="search-input-loading"]',
    ) as HTMLElement | null;
    expect(loading).not.toBeNull();
    expect(loading).toHaveAttribute("aria-label", "Loading");
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("SearchInput.Item emits si-item-* classes (not cmdk-*) on inner spans", () => {
    function Icon({ className }: { className?: string }) {
      return <svg data-testid="icon" className={className} />;
    }
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="x" icon={Icon} trailing={<kbd>K</kbd>}>
              Hello
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "h" } });
    fireEvent.submit(screen.getByRole("search"));
    const icon = screen.getByTestId("icon");
    const iconClass = icon.getAttribute("class") ?? "";
    expect(iconClass).toContain("si-item-icon");
    expect(iconClass).not.toContain("cmdk-item-icon");

    const label = screen.getByText("Hello");
    expect(label.getAttribute("class") ?? "").toContain("si-item-label");
    expect(label.getAttribute("class") ?? "").not.toContain("cmdk-item-label");

    const trail = screen.getByText("K").closest("kbd")?.parentElement;
    expect(trail?.getAttribute("class") ?? "").toContain("si-item-trail");
    expect(trail?.getAttribute("class") ?? "").not.toContain("cmdk-item-trail");
  });
});
