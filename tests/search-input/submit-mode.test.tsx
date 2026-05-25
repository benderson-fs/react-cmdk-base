import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

describe("SearchInput submit mode", () => {
  it("does not open panel while typing", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} mode="submit" collapsible={false}>
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
    await user.keyboard("al");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens panel after submit", async () => {
    const user = userEvent.setup();
    render(
      <SearchInput.Root onSubmit={() => {}} mode="submit" collapsible={false}>
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
    await user.keyboard("al{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("empty-query submit is a no-op in submit mode", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root onSubmit={onSubmit} mode="submit" collapsible={false}>
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sync throw in onSubmit does NOT open the panel", async () => {
    const user = userEvent.setup();
    const onResultsOpenChange = vi.fn();
    const onSubmit = vi.fn(() => {
      throw new Error("validation failed");
    });
    render(
      <SearchInput.Root
        onSubmit={onSubmit}
        mode="submit"
        collapsible={false}
        onResultsOpenChange={onResultsOpenChange}
      >
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
    await user.keyboard("hi{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    // resultsOpen never flipped to true (the commit was aborted)
    expect(onResultsOpenChange.mock.calls.some((c) => c[0] === true)).toBe(false);
  });

  it("async rejection KEEPS the panel open", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => {
      throw new Error("response failed");
    });
    render(
      <SearchInput.Root onSubmit={onSubmit} mode="submit" collapsible={false}>
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
    await user.keyboard("al{Enter}");
    // Panel opened (sync portion succeeded); async rejection is silent.
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
