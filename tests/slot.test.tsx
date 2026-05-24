import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { Slot } from "../src/lib/slot";
import {
  CommandMenuRoot,
  CommandMenuList,
  CommandMenuGroup,
  CommandMenuItem,
} from "../src";

describe("Slot", () => {
  it("renders the child element with merged className", () => {
    render(
      <Slot className="from-parent">
        <button className="from-child">Click</button>
      </Slot>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toBe("from-parent from-child");
  });

  it("merges and composes onClick — child handler runs after parent", async () => {
    const order: string[] = [];
    const parent = () => order.push("parent");
    const child = () => order.push("child");
    const user = userEvent.setup();

    render(
      <Slot onClick={parent}>
        <button onClick={child}>Click</button>
      </Slot>,
    );
    await user.click(screen.getByRole("button"));
    expect(order).toEqual(["parent", "child"]);
  });

  it("parent can call event.preventDefault() to skip the child handler", async () => {
    const child = vi.fn();
    const user = userEvent.setup();

    render(
      <Slot
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
        }}
      >
        <button onClick={child}>Click</button>
      </Slot>,
    );
    await user.click(screen.getByRole("button"));
    expect(child).not.toHaveBeenCalled();
  });

  it("forwards refs to the child element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Slot ref={ref}>
        <button>Click</button>
      </Slot>,
    );
    expect(ref.current?.tagName).toBe("BUTTON");
  });

  it("child props win on collision (except className and event handlers)", () => {
    render(
      <Slot data-testid="parent" type="submit">
        <button type="button" data-testid="child">
          Click
        </button>
      </Slot>,
    );
    const btn = screen.getByTestId("child");
    expect(btn.getAttribute("type")).toBe("button");
  });

  it("throws a helpful error if children is not a single element", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <Slot>
          <span>one</span>
          <span>two</span>
        </Slot>,
      ),
    ).toThrow(/single React element/);
    spy.mockRestore();
  });

  it("preserves ref identity across re-renders", () => {
    const calls: Array<HTMLElement | null> = [];
    const refCb = (node: HTMLElement | null) => calls.push(node);

    function Wrapper({ tick }: { tick: number }) {
      return (
        <Slot>
          <button ref={refCb} data-tick={tick}>X</button>
        </Slot>
      );
    }
    const { rerender } = render(<Wrapper tick={0} />);
    const initialCalls = calls.length;
    rerender(<Wrapper tick={1} />);
    rerender(<Wrapper tick={2} />);

    // Re-renders that produce the same node must not call refCb again.
    // (One initial mount call is the only acceptable invocation.)
    expect(calls.length).toBe(initialCalls);
    // And no momentary null in the trailing tail. Precondition: the array
    // must be non-empty, otherwise `calls[-1]` is undefined which !== null
    // and the assertion passes vacuously.
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[calls.length - 1]).not.toBeNull();
  });

  it("preserves forwarded object-ref identity across re-renders", () => {
    const ref = React.createRef<HTMLButtonElement>();
    const nullSightings: Array<HTMLButtonElement | null> = [];

    function Wrapper({ tick }: { tick: number }) {
      // Snapshot ref.current on each render to detect transient null writes.
      nullSightings.push(ref.current);
      return (
        <Slot ref={ref}>
          <button data-tick={tick}>X</button>
        </Slot>
      );
    }
    const { rerender } = render(<Wrapper tick={0} />);
    rerender(<Wrapper tick={1} />);
    rerender(<Wrapper tick={2} />);

    // The first render snapshot may be null (before commit). After mount,
    // ref.current must be a button — and subsequent renders should NOT see
    // it flip back to null between renders.
    expect(ref.current).not.toBeNull();
    // No null in the trailing entries (after first mount).
    const trailingNulls = nullSightings.slice(1).filter((v) => v === null);
    expect(trailingNulls).toEqual([]);
  });

  it("honors event.baseUIHandlerPrevented to skip the child handler", () => {
    const childClick = vi.fn();
    function Parent({ children }: { children: React.ReactElement }) {
      return (
        <Slot
          onClick={(e: React.MouseEvent & { baseUIHandlerPrevented?: boolean }) => {
            // Simulate Base UI's gating flag.
            e.baseUIHandlerPrevented = true;
          }}
        >
          {children}
        </Slot>
      );
    }
    render(
      <Parent>
        <button type="button" onClick={childClick}>X</button>
      </Parent>,
    );
    fireEvent.click(screen.getByRole("button", { name: "X" }));
    expect(childClick).not.toHaveBeenCalled();
  });

  it("forceProps overrides child props on collision", () => {
    render(
      <Slot data-slot="parent" forceProps={{ "data-slot": "locked" }}>
        <button type="button" data-slot="child">X</button>
      </Slot>,
    );
    const btn = screen.getByRole("button", { name: "X" });
    expect(btn.getAttribute("data-slot")).toBe("locked");
  });

  it("preserves parent handler when child explicitly passes undefined", async () => {
    const parentClick = vi.fn();
    function Parent({ children }: { children: React.ReactElement }) {
      return <Slot onClick={parentClick}>{children}</Slot>;
    }
    const user = userEvent.setup();
    const { container } = render(
      <Parent>
        <button onClick={undefined}>X</button>
      </Parent>,
    );
    await user.click(container.querySelector("button")!);
    expect(parentClick).toHaveBeenCalledTimes(1);
  });

  it("warns in dev when forceProps includes ref", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <Slot forceProps={{ ref: () => {} }}>
        <button>X</button>
      </Slot>,
    );
    expect(
      errSpy.mock.calls.some((args) =>
        String(args[0]).includes("`ref` in `forceProps`"),
      ),
    ).toBe(true);
    errSpy.mockRestore();
  });

  it("does not emit React 19 element.ref deprecation warnings during normal render", () => {
    const warnSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Slot>
          <button ref={ref} type="button">X</button>
        </Slot>,
      );
      expect(ref.current).not.toBeNull();
      const refWarnings = warnSpy.mock.calls
        .map((args) => String(args[0] ?? ""))
        .filter((msg) => msg.includes("Accessing element.ref"));
      expect(refWarnings).toEqual([]);
    } finally {
      warnSpy.mockRestore();
    }
  });
});

describe("CommandMenuItem asChild composition", () => {
  it("preserves the consumer child element's onClick AND fires fireSelect", () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    render(
      <CommandMenuRoot open onOpenChange={() => {}}>
        <CommandMenuList>
          <CommandMenuGroup heading="A">
            <CommandMenuItem value="a" asChild onSelect={onSelect}>
              <a href="#a" onClick={onClick}>Anchor</a>
            </CommandMenuItem>
          </CommandMenuGroup>
        </CommandMenuList>
      </CommandMenuRoot>,
    );
    const anchor = screen.getByRole("option", { name: "Anchor" });
    fireEvent.click(anchor);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("a");
  });
});
