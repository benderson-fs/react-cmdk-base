import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.Item asChild aria-label", () => {
  it("falls back to accessibleName (value) when consumer doesn't provide aria-label", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="profile" asChild>
              <a href="/profile">
                <svg data-testid="icon" />
              </a>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("search"));
    const option = screen.getByRole("option");
    expect(option).toHaveAttribute("aria-label", "profile");
  });
});
