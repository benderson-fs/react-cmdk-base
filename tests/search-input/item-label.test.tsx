import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.ItemLabel", () => {
  it("ItemLabel seeds the filter target", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha">
              <SearchInput.ItemLabel>Alpha — primary contact</SearchInput.ItemLabel>
              <span aria-hidden>★</span>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("primary");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option")).toHaveAccessibleName(
      "Alpha — primary contact",
    );
  });

  it("falls back to children text when ItemLabel absent", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha">Just text</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("just");
    expect(screen.getByRole("option")).toHaveAccessibleName("Just text");
  });
});
