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
    expect(onSubmit.mock.calls[0][0]).toEqual({ query: "hi" });
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
});
