import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.FreeSearch + Empty coexistence", () => {
  it("FreeSearch does not suppress Empty when no real items match", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha">Alpha</SearchInput.Item>
            <SearchInput.FreeSearch />
            <SearchInput.Empty>No results</SearchInput.Empty>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzzz" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByText(/Search for/i)).toBeInTheDocument();
    // Empty must be visible (not just mounted-hidden) — FreeSearch's
    // `keywords=["*"]` should not inflate matchCount and suppress Empty.
    expect(screen.getByText("No results")).not.toHaveAttribute("hidden");
  });
});
