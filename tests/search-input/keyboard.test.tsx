import * as React from "react";
import { describe, expect, it, vi } from "vitest";
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
    // Re-query the input — committing the query causes CommandCoreProvider
    // (keyed by committedQuery) to remount the visible input.
    const inputAfterSubmit = screen.getByRole("combobox");
    fireEvent.keyDown(inputAfterSubmit, { key: "Escape" });
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

  it("ArrowDown from the input moves option highlight into the popup", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha">Alpha</SearchInput.Item>
            <SearchInput.Item value="bravo">Bravo</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.submit(screen.getByRole("search"));
    // Re-query: CommandCoreProvider remounts on committed-query change, so
    // the visible input element is replaced.
    const inputAfterSubmit = screen.getByRole("combobox");
    fireEvent.keyDown(inputAfterSubmit, { key: "ArrowDown" });
    expect(
      screen.getByRole("option", { name: "Alpha" }),
    ).toHaveAttribute("data-highlighted");
    fireEvent.keyDown(inputAfterSubmit, { key: "ArrowDown" });
    expect(
      screen.getByRole("option", { name: "Bravo" }),
    ).toHaveAttribute("data-highlighted");
  });

  it("Enter on a highlighted option fires onSelect and closes the popup", () => {
    const onSelect = vi.fn();
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha" onSelect={onSelect}>
              Alpha
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.submit(screen.getByRole("search"));
    // Re-query: CommandCoreProvider remounts on committed-query change.
    const inputAfterSubmit = screen.getByRole("combobox");
    fireEvent.keyDown(inputAfterSubmit, { key: "ArrowDown" });
    fireEvent.keyDown(inputAfterSubmit, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("alpha");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
