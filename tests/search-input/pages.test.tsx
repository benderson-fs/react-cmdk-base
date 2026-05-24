import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";
import { useCommandCore } from "../../src/internal/command-core";

function DrillButton({ to }: { to: string }) {
  const { setPage } = useCommandCore();
  return <button onClick={() => setPage(to)}>drill</button>;
}

describe("SearchInput pages", () => {
  it("drills into a child page when an Item calls setPage", () => {
    render(
      <SearchInput.Root onSubmit={() => {}}>
        <SearchInput.Input />
        <SearchInput.Results>
          <SearchInput.Page id="root">
            <SearchInput.Item value="folder" keepOpen onSelect={() => {}}>
              Folder
            </SearchInput.Item>
            <DrillButton to="folder" />
          </SearchInput.Page>
          <SearchInput.Page id="folder">
            <SearchInput.Item value="leaf">Leaf</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>,
    );
    // Use a query that matches "Folder" so the Item renders before drill.
    // setPage clears the internal query to "" on transition, so all items
    // on the "folder" page (e.g. "Leaf") match unconditionally afterwards.
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "f" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByText("Folder")).toBeInTheDocument();
    fireEvent.click(screen.getByText("drill"));
    expect(screen.queryByText("Folder")).not.toBeInTheDocument();
    expect(screen.getByText("Leaf")).toBeInTheDocument();
  });
});
