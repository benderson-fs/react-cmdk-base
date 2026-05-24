import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.Results", () => {
  it("does not render the popup until submit", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="hello">Hello</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders the popup after submit", async () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="hello">Hello</SearchInput.Item>
            <SearchInput.Item value="world">World</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "hello" },
    });
    fireEvent.submit(screen.getByRole("search"));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Hello" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "World" })).not.toBeInTheDocument();
  });

  it("a second submit with a new query updates the results", async () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="hello">Hello</SearchInput.Item>
            <SearchInput.Item value="world">World</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(await screen.findByRole("option", { name: "Hello" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "World" })).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "world" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(await screen.findByRole("option", { name: "World" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Hello" })).not.toBeInTheDocument();
  });
});
