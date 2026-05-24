import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("fires onSubmit with the committed query on Enter", () => {
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
    expect(onSubmit.mock.calls[0][0]).toEqual({ query: "hello" });
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

  it("a synchronous onSubmit throw is swallowed without leaving inconsistent state", () => {
    const onSubmit = vi.fn(() => {
      throw new Error("sync throw");
    });
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <SearchInput.Root onSubmit={onSubmit}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="x">X</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "x" } });
    expect(() =>
      fireEvent.submit(screen.getByRole("search")),
    ).not.toThrow();
    expect(onSubmit).toHaveBeenCalledOnce();
    err.mockRestore();
  });
});
