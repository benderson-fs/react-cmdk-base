import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

describe("SearchInput live mode panel mount", () => {
  it("panel stays closed when query empty + focused", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha">
              <SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens on typing when matches exist", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
            <SearchInput.Item value="bravo"><SearchInput.ItemLabel>Bravo</SearchInput.ItemLabel></SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("al");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("closes when query has no matches", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("zzz");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes on blur out of the form", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchInput.Root onSubmit={() => {}} collapsible={false}>
          <SearchInput.Input />
          <SearchInput.ResultsInline>
            <SearchInput.Page id="root">
              <SearchInput.Item value="alpha"><SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel></SearchInput.Item>
            </SearchInput.Page>
          </SearchInput.ResultsInline>
        </SearchInput.Root>
        <button type="button">Outside</button>
      </>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("al");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
