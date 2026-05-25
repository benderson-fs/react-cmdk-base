import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/search-input";

// Regression: typing into the input was opening the popover and stealing
// focus into the listbox, because the inner Combobox.Root auto-opens on
// input change (Base UI behavior) and the bridge wired `onOpenChange` to
// our user-visible `resultsOpen` state. The popover must open ONLY on
// successful submit — the SearchInput is a submit-only results model.
describe("SearchInput typing does not open the popover or steal focus", () => {
  it("typing in the input keeps focus on the input and leaves results closed", async () => {
    const user = userEvent.setup();
    const onResultsOpenChange = vi.fn();
    render(
      <SearchInput.Root
        onSubmit={() => {}}
        collapsible={false}
        onResultsOpenChange={onResultsOpenChange}
      >
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="alpha">Alpha</SearchInput.Item>
            <SearchInput.Item value="bravo">Bravo</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );

    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(input).toHaveFocus();

    await user.keyboard("al");

    // The input still holds focus — the popover never opened, so focus did
    // not move into a listbox option.
    expect(document.activeElement).toBe(input);
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    // The user-visible resultsOpen state was never flipped to true.
    expect(
      onResultsOpenChange.mock.calls.some((c) => c[0] === true),
    ).toBe(false);
  });
});
