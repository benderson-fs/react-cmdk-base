import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput result parts", () => {
  it("renders Group heading, Empty, Loading, Separator inside Results", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Group heading="Docs">
              <SearchInput.Item value="one">One</SearchInput.Item>
            </SearchInput.Group>
            <SearchInput.Separator />
            <SearchInput.Loading label="Loading" />
            <SearchInput.Empty alwaysRender>Nothing here</SearchInput.Empty>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "x" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});
