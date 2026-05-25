import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { SearchInput } from "../../src/search-input";

expect.extend(toHaveNoViolations);

describe("SearchInput a11y", () => {
  it("has no axe violations on the canonical example", async () => {
    const { container } = render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Toolbar>
          <SearchInput.Tools>
            <SearchInput.Picker name="scope" defaultValue="all">
              <SearchInput.PickerTrigger />
              <SearchInput.PickerContent>
                <SearchInput.PickerItem value="all">All</SearchInput.PickerItem>
                <SearchInput.PickerItem value="docs">Docs</SearchInput.PickerItem>
              </SearchInput.PickerContent>
            </SearchInput.Picker>
          </SearchInput.Tools>
          <SearchInput.Submit />
        </SearchInput.Toolbar>
      </SearchInput.Root>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("popup options are listbox children; no progressbar/status inside listbox", async () => {
    const { container } = render(
      <SearchInput.Root onSubmit={() => {}} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="a">Alpha</SearchInput.Item>
            <SearchInput.Empty>None.</SearchInput.Empty>
            <SearchInput.Loading label="Loading…" />
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "a" } });
    fireEvent.submit(screen.getByRole("search"));
    const listbox = screen.getByRole("listbox");
    expect(listbox.querySelector('[role="status"]')).toBeNull();
    expect(listbox.querySelector('[role="progressbar"]')).toBeNull();
    // Disable aria-command-name: Base UI's combobox renders internal
    // focus-guard <span role="button"> elements without accessible names.
    // Those are a library-internal a11y concern, not part of our contract.
    const results = await axe(container, {
      rules: { "aria-command-name": { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
