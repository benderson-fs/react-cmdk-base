import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.Root filter prop", () => {
  it("uses the custom filter function for popup options (rejectAll → no options)", () => {
    const rejectAll = () => false;
    render(
      <SearchInput.Root onSubmit={() => {}} filter={rejectAll}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="apple">Apple</SearchInput.Item>
            <SearchInput.Item value="banana">Banana</SearchInput.Item>
            <SearchInput.Item value="apricot">Apricot</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ap" } });
    fireEvent.submit(screen.getByRole("search"));
    // Custom filter rejects everything → NO options should render.
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
