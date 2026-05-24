import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../src/search-input";

describe("SearchInput.Root scope", () => {
  it("scope={null} keeps the component in controlled mode (no internal-state takeover)", () => {
    // The bait pattern is `scope={undefined}` flipping to uncontrolled.
    // `null` is the documented "controlled with no selection" value:
    // it must be treated as a defined controlled value so internal state
    // never takes over.
    let receivedScope: string | undefined = undefined;
    function Harness() {
      const [scope, setScope] = React.useState<string | null>(null);
      return (
        <SearchInput.Root
          onSubmit={(msg) => {
            receivedScope = msg.scope;
          }}
          scope={scope}
          onScopeChange={(next) => setScope(next)}
        >
          <SearchInput.Input />
        </SearchInput.Root>
      );
    }
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "q" } });
    fireEvent.submit(screen.getByRole("search"));
    // null surfaces as undefined in the message (downstream consumers
    // don't have to handle two "no selection" values).
    expect(receivedScope).toBeUndefined();
  });

  it("warns in dev when scope transitions from defined to undefined", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function Harness({ scope }: { scope: string | undefined }) {
      return (
        <SearchInput.Root onSubmit={() => {}} scope={scope}>
          <SearchInput.Input />
        </SearchInput.Root>
      );
    }
    const { rerender } = render(<Harness scope="all" />);
    expect(warn).not.toHaveBeenCalled();
    rerender(<Harness scope={undefined} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(
      /scope.*transitioned.*to.*undefined/i,
    );
    warn.mockRestore();
  });

  it("does NOT warn when scope stays undefined across renders (uncontrolled mode)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function Harness() {
      const [, force] = React.useReducer((n: number) => n + 1, 0);
      return (
        <>
          <button onClick={() => force()}>rerender</button>
          <SearchInput.Root onSubmit={() => {}}>
            <SearchInput.Input />
          </SearchInput.Root>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText("rerender"));
    fireEvent.click(screen.getByText("rerender"));
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
