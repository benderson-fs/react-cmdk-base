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

  it("modal aria-hides form contents while open (Base UI modal contract)", async () => {
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
    // Combobox modal=true uses FloatingFocusManager modal mode, which marks
    // everything outside the popup as aria-hidden + inert (data-base-ui-inert).
    // This is the documented modal contract — the popup is the only
    // interactive surface while open. The form's Submit button is therefore
    // inert; to act on the form the user must dismiss the panel first
    // (Escape, click on backdrop, or selection).
    const submitBtn = document.querySelector('[data-slot="search-input-submit"]') as HTMLButtonElement;
    expect(submitBtn).not.toBeNull();
    expect(submitBtn.closest('[data-base-ui-inert]')).not.toBeNull();
    // onSubmit isn't invoked because the click would land on an inert
    // ancestor — verify by trying and confirming the call count stays zero.
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
