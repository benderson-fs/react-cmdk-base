import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.ResultsModal", () => {
  it("renders a backdrop while open", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsModal>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsModal>
      </SearchInput.Root>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("al");
    expect(
      document.querySelector('[data-slot="search-input-results-backdrop"]'),
    ).toBeInTheDocument();
  });

  it("click on backdrop closes the panel", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsModal>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsModal>
      </SearchInput.Root>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("al");
    const backdrop = document.querySelector(
      '[data-slot="search-input-results-backdrop"]',
    ) as HTMLElement;
    await user.click(backdrop);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Submit button inside form stays clickable while modal is open", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root onSubmit={onSubmit} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.Submit />
        <SearchInput.ResultsModal>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsModal>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("al");
    // Panel is open with backdrop; Submit button inside the form must
    // still respond to clicks (Combobox modal disables OUTSIDE pointer
    // events, not form-internal ones).
    // Use the aria-label to target the submit button specifically (Base UI's
    // FloatingFocusManager also renders a "Dismiss" button with role=button).
    await user.click(screen.getByRole("button", { name: "Submit search" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
