import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.Root loop prop", () => {
  it("loop=false: ArrowDown past the last option does not wrap", () => {
    render(
      <SearchInput.Root onSubmit={() => {}} loop={false}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha">Alpha</SearchInput.Item>
            <SearchInput.Item value="bravo">Brava</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    let input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.submit(screen.getByRole("search"));
    // Re-query after submit (committedQuery remount).
    input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" }); // past the last — must NOT wrap
    expect(screen.getByRole("option", { name: "Brava" })).toHaveAttribute(
      "data-highlighted",
    );
    expect(screen.getByRole("option", { name: "Alpha" })).not.toHaveAttribute(
      "data-highlighted",
    );
  });
});
