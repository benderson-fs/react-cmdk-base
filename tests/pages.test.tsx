import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { CommandMenu } from "../src";

function Harness() {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState("root");
  return (
    <CommandMenu.Root
      open={open}
      onOpenChange={setOpen}
      page={page}
      onPageChange={setPage}
    >
      <CommandMenu.Input />
      <CommandMenu.List>
        <CommandMenu.Page id="root">
          <CommandMenu.Item
            value="go-projects"
            keepOpen
            onSelect={() => setPage("projects")}
          >
            Projects
          </CommandMenu.Item>
        </CommandMenu.Page>
        <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
          <CommandMenu.Item value="alpha">Alpha</CommandMenu.Item>
          <CommandMenu.Item value="beta">Beta</CommandMenu.Item>
        </CommandMenu.Page>
      </CommandMenu.List>
    </CommandMenu.Root>
  );
}

describe("pages", () => {
  it("drills into a sub-page when the trigger item is clicked", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).toBeNull();

    await user.click(screen.getByText("Projects"));

    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    // breadcrumb chip is rendered next to the input
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders only the active page's items", async () => {
    render(<Harness />);
    // root page only has the Projects trigger; Alpha lives on the sub-page
    expect(screen.queryByText("Alpha")).toBeNull();
    expect(screen.queryByText("Beta")).toBeNull();
  });
});

describe("CommandMenu.Item asChild", () => {
  it("renders the child element with role='option' and merged props", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="docs" asChild>
                <a href="/docs">Docs</a>
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    // Base UI's Combobox.Item applies role="option" — the correct ARIA role
    // inside a combobox listbox, regardless of the child element type.
    const option = screen.getByRole("option", { name: "Docs" });
    expect(option.tagName).toBe("A");
    expect(option.getAttribute("href")).toBe("/docs");
    expect(option.className).toMatch(/cmdk-item/);
  });
});
