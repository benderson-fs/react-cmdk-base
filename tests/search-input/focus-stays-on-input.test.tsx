import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

describe("SearchInput focus stays on input", () => {
  for (const variant of ["inline", "modal"] as const) {
    it(`(${variant}) typing + ArrowDown keeps real focus on the input`, async () => {
      const user = userEvent.setup();
      const Results =
        variant === "inline" ? SearchInput.ResultsInline : SearchInput.ResultsModal;
      render(
        <SearchInput.Root onSubmit={() => {}} collapsible={false}>
          <SearchInput.Input />
          <Results>
            <SearchInput.Page id="root">
              <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
              <SearchInput.Item value="bravo"><SearchInput.ItemLabel>Bravo</SearchInput.ItemLabel></SearchInput.Item>
            </SearchInput.Page>
          </Results>
        </SearchInput.Root>,
      );
      const input = screen.getByRole("combobox");
      await user.click(input);
      await user.keyboard("al{ArrowDown}");
      expect(document.activeElement).toBe(input);
      expect(input).toHaveAttribute("aria-activedescendant");
    });
  }
});
