import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "@testing-library/react";
import * as React from "react";
import { CommandMenu, useCommandMenu } from "../src";

function MatchProbe() {
  const ctx = useCommandMenu();
  return <span data-testid="count">{ctx.matchCount}</span>;
}

describe("CommandMenu match tracking", () => {
  it("matchCount reflects visible items as query changes", async () => {
    const user = userEvent.setup();
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item value="banana" onSelect={() => {}}>
                Banana
              </CommandMenu.Item>
              <CommandMenu.Item value="cherry" onSelect={() => {}}>
                Cherry
              </CommandMenu.Item>
            </CommandMenu.Group>
            <MatchProbe />
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    expect(screen.getByTestId("count")).toHaveTextContent("3");

    await user.type(screen.getByRole("combobox"), "an");
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    await user.clear(screen.getByRole("combobox"));
    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });

  it("matchCount decrements when items unmount", () => {
    function Harness({ show }: { show: boolean }) {
      const ctx = useCommandMenu();
      return (
        <>
          <span data-testid="count">{ctx.matchCount}</span>
          {show ? (
            <CommandMenu.Item value="apple" onSelect={() => {}}>
              Apple
            </CommandMenu.Item>
          ) : null}
          <CommandMenu.Item value="banana" onSelect={() => {}}>
            Banana
          </CommandMenu.Item>
        </>
      );
    }

    function App({ show }: { show: boolean }) {
      return (
        <CommandMenu.Root open onOpenChange={() => {}}>
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <CommandMenu.Group>
                <Harness show={show} />
              </CommandMenu.Group>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }

    const { rerender } = render(<App show={true} />);
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    rerender(<App show={false} />);
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    rerender(<App show={true} />);
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  it("Empty is hidden in the same commit that matched items appear", async () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
            </CommandMenu.Group>
            <CommandMenu.Empty>None</CommandMenu.Empty>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    await act(async () => {
      await userEvent.type(screen.getByRole("combobox"), "appl");
    });
    expect(screen.getByText("None")).toHaveAttribute("hidden");
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });
});
