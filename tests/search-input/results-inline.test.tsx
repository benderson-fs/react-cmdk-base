import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.ResultsInline", () => {
  it("does not render a backdrop", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("al");
    expect(
      document.querySelector('[data-slot="search-input-results-backdrop"]'),
    ).toBeNull();
  });

  it("escape closes the panel", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("al");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("page remains interactive while panel is open", async () => {
    const user = userEvent.setup();
    const outsideClick = vi.fn();
    render(
      <>
        <SearchInput.Root onSubmit={() => {}} collapsible={false}>
          <SearchInput.Input />
          <SearchInput.ResultsInline>
            <SearchInput.Page id="root">
              <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
            </SearchInput.Page>
          </SearchInput.ResultsInline>
        </SearchInput.Root>
        <button type="button" onClick={outsideClick}>Outside</button>
      </>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("al");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(outsideClick).toHaveBeenCalledTimes(1);
  });
});
