import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.Submit", () => {
  it("disabled when query is empty and status is idle", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    expect(screen.getByRole("button", { name: /submit search/i })).toBeDisabled();
  });

  it("fires onSubmit when clicked with a non-empty query", () => {
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root onSubmit={onSubmit}>
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "hi" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit search/i }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ query: "hi" });
  });

  it("calls onStop when streaming and clicked", () => {
    const onStop = vi.fn();
    render(
      <SearchInput.Root onSubmit={() => {}} status="streaming">
        <SearchInput.Input />
        <SearchInput.Submit onStop={onStop} />
      </SearchInput.Root>,
    );
    fireEvent.click(screen.getByRole("button", { name: /stop search/i }));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it("reflects data-status and aria-label per status", () => {
    const { rerender } = render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-status", "idle");
    expect(button).toHaveAttribute("aria-label", "Submit search");

    rerender(
      <SearchInput.Root onSubmit={() => {}} status="submitted">
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    expect(button).toHaveAttribute("data-status", "submitted");
    expect(button).toHaveAttribute("aria-label", "Submitting search");

    rerender(
      <SearchInput.Root onSubmit={() => {}} status="streaming">
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    expect(button).toHaveAttribute("data-status", "streaming");
    expect(button).toHaveAttribute("aria-label", "Stop search");

    rerender(
      <SearchInput.Root onSubmit={() => {}} status="error">
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    expect(button).toHaveAttribute("data-status", "error");
    expect(button).toHaveAttribute("aria-label", "Retry search");
  });

  it("type='submit' when idle and type='button' when stoppable", () => {
    const { rerender } = render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Submit onStop={() => {}} />
      </SearchInput.Root>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    rerender(
      <SearchInput.Root onSubmit={() => {}} status="streaming">
        <SearchInput.Input />
        <SearchInput.Submit onStop={() => {}} />
      </SearchInput.Root>,
    );
    expect(button).toHaveAttribute("type", "button");
  });

  it("stays clickable while status='error' and query has content", () => {
    render(
      <SearchInput.Root onSubmit={() => {}} status="error">
        <SearchInput.Input />
        <SearchInput.Submit />
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "x" },
    });
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("does NOT let consumer disabled={false} bypass the empty-state guard", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Submit disabled={false} />
      </SearchInput.Root>,
    );
    // Query is empty + status=idle → button should still be disabled even
    // though consumer passed disabled={false}.
    expect(screen.getByRole("button", { name: /submit search/i })).toBeDisabled();
  });
});
