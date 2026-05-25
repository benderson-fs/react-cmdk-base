import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

describe("SearchInput selection", () => {
  it("Enter on highlight: onSelect, panel close, label write-back, selectedValue set", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onSelectedValueChange = vi.fn();
    render(
      <SearchInput.Root
        onSubmit={() => {}}
        collapsible={false}
        onSelectedValueChange={onSelectedValueChange}
      >
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha" onSelect={onSelect}>
              <SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("al{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("alpha");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input.value).toBe("Alpha");
    expect(onSelectedValueChange).toHaveBeenLastCalledWith("alpha");
  });

  it("keepOpen items do NOT write-back or close", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SearchInput.Root onSubmit={() => {}} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="users" keepOpen onSelect={onSelect}>
              <SearchInput.ItemLabel>Users…</SearchInput.ItemLabel>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("us{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("users");
    expect(input.value).toBe("us"); // NOT "Users…"
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("backspace-to-empty clears selectedValue", async () => {
    const user = userEvent.setup();
    const onSelectedValueChange = vi.fn();
    render(
      <SearchInput.Root
        onSubmit={() => {}}
        collapsible={false}
        defaultSelectedValue="alpha"
        onSelectedValueChange={onSelectedValueChange}
      >
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("a");
    expect(input.value).toBe("a");
    await user.keyboard("{Backspace}");
    expect(input.value).toBe("");
    expect(onSelectedValueChange).toHaveBeenLastCalledWith(null);
  });

  it("typing-after-selection does NOT clear selectedValue", async () => {
    const user = userEvent.setup();
    const onSelectedValueChange = vi.fn();
    render(
      <SearchInput.Root
        onSubmit={() => {}}
        collapsible={false}
        defaultSelectedValue="alpha"
        defaultQuery="Alpha"
        onSelectedValueChange={onSelectedValueChange}
      >
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard(" extra");
    expect(onSelectedValueChange).not.toHaveBeenCalled();
  });

  it("selection blocked while in-flight (streaming)", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SearchInput.Root onSubmit={() => {}} status="streaming" collapsible={false}>
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha" onSelect={onSelect}>
              <SearchInput.ItemLabel>Alpha</SearchInput.ItemLabel>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    // Input is disabled while in-flight per existing rule; typing
    // shouldn't even land. Assert directly that the panel doesn't open.
    await user.click(input);
    expect(input).toBeDisabled();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
