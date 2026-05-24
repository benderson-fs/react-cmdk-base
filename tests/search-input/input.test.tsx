import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.Input", () => {
  it("typing does NOT open results until submit", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="one">One</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "o" } });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Enter on the input submits the form", () => {
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root onSubmit={onSubmit}>
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "hi" } });
    // Use a form submit event to mimic Enter behavior in jsdom (which
    // doesn't propagate Enter→form-submit automatically in fireEvent).
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("Escape on empty query collapses the row", () => {
    vi.useFakeTimers();
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(screen.getByRole("search")).toHaveAttribute("data-state", "expanded");
    fireEvent.keyDown(input, { key: "Escape" });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByRole("search")).toHaveAttribute("data-state", "collapsed");
    vi.useRealTimers();
  });

  it("ignores consumer-supplied role and aria-controls overrides", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input
          role={"searchbox" as React.AriaRole}
          aria-controls="custom-popup"
        />
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("role", "combobox");
    expect(input).not.toHaveAttribute("aria-controls", "custom-popup");
  });

  it("ignores consumer-supplied id override", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input id="my-search" />
      </SearchInput.Root>,
    );
    expect(screen.getByRole("combobox")).not.toHaveAttribute("id", "my-search");
  });
});
