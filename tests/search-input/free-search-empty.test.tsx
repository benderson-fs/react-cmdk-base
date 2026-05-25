import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.FreeSearch + Empty coexistence", () => {
  it("FreeSearch does not suppress Empty when no real items match", async () => {
    render(
      <SearchInput.Root onSubmit={() => {}} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha">Alpha</SearchInput.Item>
            <SearchInput.FreeSearch />
            <SearchInput.Empty>No results</SearchInput.Empty>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzzz" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByText(/Search for/i)).toBeInTheDocument();
    // Empty must be visible (not just mounted-hidden) — FreeSearch's
    // `keywords=["*"]` should not inflate matchCount and suppress Empty.
    // toBeVisible catches inline-style display:none, aria-hidden, AND
    // the [hidden] attribute, so it's strictly stronger than the prior
    // attribute-only assertion. waitFor handles the Base UI Popup's
    // positioning lifecycle, which sets opacity:0 on its wrapper during
    // initial anchor measurement.
    await waitFor(() =>
      expect(screen.getByText("No results")).toBeVisible(),
    );
  });
});
