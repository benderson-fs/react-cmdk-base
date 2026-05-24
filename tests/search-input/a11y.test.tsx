import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
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
});
