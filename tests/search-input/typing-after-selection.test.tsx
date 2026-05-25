import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

describe("SearchInput typing after selection", () => {
  it("type → select → type again → ArrowDown highlights items", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha thing</SearchInput.ItemLabel></SearchInput.Item>
            <SearchInput.Item value="alphabet"><SearchInput.ItemLabel>Alphabet song</SearchInput.ItemLabel></SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("al{ArrowDown}{Enter}");
    expect(input.value).toBe("Alpha thing");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    // Resume typing — mute should clear, panel re-opens.
    await user.keyboard(" extra");
    // The query is now "Alpha thing extra" — no matches → panel closed.
    // Verify mute cleared by typing something that matches again:
    await user.clear(input);
    await user.keyboard("alphabet");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    expect(
      screen.getByRole("option", { name: /Alphabet song/ }),
    ).toHaveAttribute("data-highlighted");
  });
});
