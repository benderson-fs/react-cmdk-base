import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput collapsible", () => {
  it("starts collapsed when collapsible=true and defaultCollapsed unset", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    expect(screen.getByRole("search")).toHaveAttribute(
      "data-state",
      "collapsed",
    );
  });

  it("expands on pointerEnter and collapses 150ms after pointerLeave when empty", () => {
    vi.useFakeTimers();
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const form = screen.getByRole("search");
    fireEvent.pointerEnter(form);
    expect(form).toHaveAttribute("data-state", "expanded");
    fireEvent.pointerLeave(form);
    expect(form).toHaveAttribute("data-state", "expanded");
    act(() => {
      vi.advanceTimersByTime(160);
    });
    expect(form).toHaveAttribute("data-state", "collapsed");
    vi.useRealTimers();
  });

  it("expands on input focus", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("data-state", "collapsed");
    fireEvent.focus(screen.getByRole("combobox"));
    expect(form).toHaveAttribute("data-state", "expanded");
  });
});
