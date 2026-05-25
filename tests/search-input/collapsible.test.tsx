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

  it("input has aria-expanded='false' when results are closed", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("Escape closes results first, then a second Escape collapses the row", () => {
    vi.useFakeTimers();
    render(
      <SearchInput.Root
        onSubmit={() => {}}
        mode="submit"
        defaultResultsOpen
        defaultCollapsed={false}
      >
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    input.focus();
    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("search")).toHaveAttribute(
      "data-state",
      "expanded",
    );
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.getByRole("search")).toHaveAttribute(
      "data-state",
      "collapsed",
    );
    vi.useRealTimers();
  });

  it("mode='submit': row stays expanded while panel is open with empty query", () => {
    vi.useFakeTimers();
    render(
      <SearchInput.Root
        onSubmit={() => {}}
        mode="submit"
        defaultResultsOpen
        defaultCollapsed={false}
      >
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const form = screen.getByRole("search");
    const input = screen.getByRole("combobox");
    // Panel is open (defaultResultsOpen), query is empty — isEmptyForCollapse
    // checks !resultsOpen, so the row must NOT collapse on pointerLeave.
    fireEvent.pointerLeave(form);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Form should remain expanded because resultsOpen is true, proving the
    // `!resultsOpen` term in isEmptyForCollapse is load-bearing.
    expect(form).toHaveAttribute("data-state", "expanded");
    vi.useRealTimers();
  });
});
