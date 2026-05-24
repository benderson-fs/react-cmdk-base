import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput integration", () => {
  it("submit → result shown → click result → onSelect fires + popup closes", () => {
    const onSelect = vi.fn();
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Submit />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="hello" onSelect={onSelect}>
              Hello
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "hello" },
    });
    fireEvent.submit(screen.getByRole("search"));
    const option = screen.getByRole("option", { name: "Hello" });
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith("hello");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
