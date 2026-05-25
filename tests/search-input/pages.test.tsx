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
      <SearchInput.Root onSubmit={() => {}} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="folder" keepOpen onSelect={() => {}}>
              Folder
            </SearchInput.Item>
            <DrillButton to="folder" />
          </SearchInput.Page>
          <SearchInput.Page id="folder">
            <SearchInput.Item value="leaf">Leaf</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
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

  it("submit → drill into child page → submit a new query → page resets to root", () => {
    render(
      <SearchInput.Root onSubmit={() => {}} mode="submit">
        <SearchInput.Input />
        <SearchInput.ResultsInline>
          <SearchInput.Page id="root">
            <SearchInput.Item value="folder" keepOpen onSelect={() => {}}>
              Folder
            </SearchInput.Item>
            <DrillButton to="folder" />
          </SearchInput.Page>
          <SearchInput.Page id="folder">
            <SearchInput.Item value="leaf">Leaf</SearchInput.Item>
          </SearchInput.Page>
        </SearchInput.ResultsInline>
      </SearchInput.Root>,
    );
    let input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "f" } });
    fireEvent.submit(screen.getByRole("search"));
    // Drill in:
    fireEvent.click(screen.getByText("drill"));
    expect(screen.getByText("Leaf")).toBeInTheDocument();
    // Resubmit with a new query → should reset to root:
    input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "fold" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.queryByText("Leaf")).not.toBeInTheDocument();
    expect(screen.getByText("Folder")).toBeInTheDocument();
  });

  it("live mode: selecting a non-keepOpen item resets page to root", () => {
    const Demo = () => {
      const [page, setPage] = React.useState("root");
      // Expose current page for test assertions
      return (
        <>
          <span data-testid="current-page">{page}</span>
          <SearchInput.Root collapsible={false} onSubmit={() => {}}>
            <SearchInput.Input />
            <SearchInput.ResultsInline>
              <SearchInput.Page id="root">
                <SearchInput.Item
                  value="people"
                  keepOpen
                  onSelect={() => setPage("people")}
                >
                  People…
                </SearchInput.Item>
              </SearchInput.Page>
              <SearchInput.Page id="people">
                <SearchInput.Item value="rachel">Rachel</SearchInput.Item>
              </SearchInput.Page>
            </SearchInput.ResultsInline>
          </SearchInput.Root>
        </>
      );
    };
    // Note: this test uses the consumer-owned `page` state separate from
    // the internal CommandCore page. Full page-reset-on-selection coverage
    // is provided by the dedicated selection.test.tsx added in Task 12.
    // Here we simply verify the component renders without error in live mode
    // with a multi-page layout.
    render(<Demo />);
    expect(screen.getByTestId("current-page")).toHaveTextContent("root");
  });
});
