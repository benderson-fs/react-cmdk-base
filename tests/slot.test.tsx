import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { Slot } from "../src/lib/slot";

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
});
