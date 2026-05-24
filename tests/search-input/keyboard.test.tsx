import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput keyboard", () => {
  it("Escape closes results and returns to input", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="hello">Hello</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("input has role=combobox + aria-expanded + aria-controls + aria-haspopup", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-controls");
    expect(input).toHaveAttribute("aria-haspopup", "listbox");
  });
});
