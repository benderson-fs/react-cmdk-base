import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.Root", () => {
  it("renders a form with aria-label and data-slot", () => {
    render(
      <SearchInput.Root onSubmit={() => {}} label="Test search">
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const form = screen.getByRole("search");
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("aria-label", "Test search");
    expect(form).toHaveAttribute("data-slot", "search-input-root");
  });

  it("fires onSubmit with the query on Enter", () => {
    const onSubmit = vi.fn();
    render(
      <SearchInput.Root onSubmit={onSubmit}>
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ query: "hello" });
  });

  it("ignores consumer-supplied role and aria-label overrides on the form", () => {
    render(
      <SearchInput.Root
        onSubmit={() => {}}
        role={"region" as React.AriaRole}
        aria-label={undefined}
      >
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("aria-label", "Search");
  });

  it("a synchronous onSubmit throw does not escape AND does not open the popup", () => {
    const onSubmit = vi.fn(() => {
      throw new Error("sync throw");
    });
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <SearchInput.Root onSubmit={onSubmit} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="x">X</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "x" } });
    expect(() =>
      fireEvent.submit(screen.getByRole("search")),
    ).not.toThrow();
    expect(onSubmit).toHaveBeenCalledOnce();
    // State coherence: the sync throw must abort before mutating popup state.
    // Otherwise the popup opens without the consumer having processed it.
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    err.mockRestore();
  });

  it("ignores consumer-supplied data-state and data-slot overrides on the form", () => {
    render(
      <SearchInput.Root
        onSubmit={() => {}}
        data-state="hijack"
        data-slot="not-search"
      >
        <SearchInput.Input />
      </SearchInput.Root>,
    );
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("data-slot", "search-input-root");
    // collapsible defaults to true; collapsed defaults to true; expected="collapsed"
    expect(form).toHaveAttribute("data-state", "collapsed");
  });

  it("an async onSubmit rejection is swallowed; popup stays open (request was dispatched)", async () => {
    const onSubmit = vi.fn(() => Promise.reject(new Error("async fail")));
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <SearchInput.Root onSubmit={onSubmit} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="x">X</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "x" } });
    fireEvent.submit(screen.getByRole("search"));
    // Wait until the consumer's onSubmit has been observed; waitFor flushes
    // microtasks reliably regardless of how many internal awaits handleSubmit
    // adds in the future.
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    // Async failure ≠ sync throw: the request was dispatched, so the popup
    // stays open. The consumer surfaces the error via status="error".
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    err.mockRestore();
  });
});
