import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.Item asChild aria-label", () => {
  it("falls back to accessibleName (value) when children carry no inherent name", () => {
    render(
      <SearchInput.Root onSubmit={() => {}} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="profile" asChild>
              <a href="/profile">
                <svg data-testid="icon" />
              </a>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("search"));
    const option = screen.getByRole("option");
    expect(option).toHaveAttribute("aria-label", "profile");
  });

  it("explicit consumer aria-label wins over the value fallback", () => {
    render(
      <SearchInput.Root onSubmit={() => {}} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item
              value="profile"
              aria-label="Open profile page"
              asChild
            >
              <a href="/profile">
                <svg data-testid="icon" />
              </a>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByRole("option")).toHaveAttribute(
      "aria-label",
      "Open profile page",
    );
  });

  it("does NOT set aria-label when children carry an <img alt>", () => {
    render(
      <SearchInput.Root onSubmit={() => {}} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="profile-slug" asChild>
              <a href="/profile">
                <img src="/avatar.png" alt="Open profile" />
              </a>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("search"));
    const option = screen.getByRole("option");
    expect(option).not.toHaveAttribute("aria-label");
  });

  it("does NOT set aria-label when an <svg> child carries a <title>", () => {
    render(
      <SearchInput.Root onSubmit={() => {}} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="profile-slug" asChild>
              <a href="/profile">
                <svg>
                  <title>Open profile</title>
                </svg>
              </a>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("search"));
    const option = screen.getByRole("option");
    expect(option).not.toHaveAttribute("aria-label");
  });

  it("recurses past intermediate wrapper elements when detecting the inherent name", () => {
    // hasAccessibleNameInTree must descend through wrapper host elements
    // (e.g. <span>) before finding the <img alt>. A regression that broke
    // recursion at depth >= 2 would silently re-apply the value fallback.
    render(
      <SearchInput.Root onSubmit={() => {}} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="profile-slug" asChild>
              <a href="/profile">
                <span>
                  <span>
                    <img src="/avatar.png" alt="Open profile" />
                  </span>
                </span>
              </a>
            </SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("search"));
    const option = screen.getByRole("option");
    expect(option).not.toHaveAttribute("aria-label");
  });
});
