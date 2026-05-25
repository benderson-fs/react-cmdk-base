import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

describe("SearchInput submit action", () => {
  it("submit button fires onSubmit with { query, scope, selectedValue }", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root
        onSubmit={onSubmit}
        collapsible={false}
        defaultSelectedValue="alpha"
        defaultQuery="Alpha"
      >
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    await user.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      query: "Alpha",
      selectedValue: "alpha",
    });
  });

  it("Enter when nothing is highlighted fires onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root onSubmit={onSubmit} collapsible={false}>
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
    await user.keyboard("z{Enter}"); // 'z' no matches → no highlight → submit fires
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("Enter on highlight does NOT fire onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root onSubmit={onSubmit} collapsible={false}>
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
    await user.keyboard("al{ArrowDown}{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("live mode allows submit with empty query when selectedValue set", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root onSubmit={onSubmit} defaultSelectedValue="alpha" collapsible={false}>
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    await user.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("live mode blocks submit with empty query and no selectedValue", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root onSubmit={onSubmit} collapsible={false}>
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    const submitBtn = screen.getByRole("button");
    expect(submitBtn).toBeDisabled();
    // Enter from the input also no-ops.
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
