import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { useDragDrop } from "../src/lib/use-drag-drop";

function dragEvent(
  type: string,
  init: { types?: string[]; files?: File[] } = {},
): Event {
  const evt = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(evt, "dataTransfer", {
    value: { types: init.types ?? [], files: init.files ?? [] },
  });
  return evt;
}

interface HostProps {
  onDrop: (files: FileList) => void;
  hostRef?: React.MutableRefObject<HTMLDivElement | null>;
}

function Host({ onDrop, hostRef }: HostProps) {
  const { isDragging, bind } = useDragDrop({ onDrop });
  const merged = React.useCallback(
    (node: HTMLDivElement | null) => {
      bind(node);
      if (hostRef) hostRef.current = node;
    },
    [bind, hostRef],
  );
  return <div ref={merged} data-testid="host" data-state={isDragging ? "dragging" : "idle"} />;
}

describe("useDragDrop", () => {
  it("ignores non-Files drag events", () => {
    const onDrop = vi.fn();
    const ref = React.createRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement | null>;
    const { getByTestId } = render(<Host onDrop={onDrop} hostRef={ref} />);
    fireEvent(ref.current!, dragEvent("dragenter", { types: ["text/plain"] }));
    expect(getByTestId("host").getAttribute("data-state")).toBe("idle");
  });

  it("uses depth counter so nested enter/leave doesn't flicker isDragging", () => {
    const onDrop = vi.fn();
    const ref = React.createRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement | null>;
    const { getByTestId } = render(<Host onDrop={onDrop} hostRef={ref} />);
    const node = ref.current!;

    fireEvent(node, dragEvent("dragenter", { types: ["Files"] }));
    fireEvent(node, dragEvent("dragenter", { types: ["Files"] }));
    expect(getByTestId("host").getAttribute("data-state")).toBe("dragging");

    fireEvent(node, dragEvent("dragleave", { types: ["Files"] }));
    expect(getByTestId("host").getAttribute("data-state")).toBe("dragging");

    fireEvent(node, dragEvent("dragleave", { types: ["Files"] }));
    expect(getByTestId("host").getAttribute("data-state")).toBe("idle");
  });

  it("calls onDrop with dropped files and resets isDragging", () => {
    const onDrop = vi.fn();
    const ref = React.createRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement | null>;
    const { getByTestId } = render(<Host onDrop={onDrop} hostRef={ref} />);
    const node = ref.current!;
    const file = new File(["x"], "x.txt", { type: "text/plain" });

    fireEvent(node, dragEvent("dragenter", { types: ["Files"] }));
    fireEvent(node, dragEvent("drop", { types: ["Files"], files: [file] }));

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(getByTestId("host").getAttribute("data-state")).toBe("idle");
  });

  it("does not re-bind listeners when onDrop identity changes across renders", () => {
    // Spy on addEventListener on every div that mounts. After the component
    // mounts we capture the baseline count (which includes React's own
    // synthetic-event delegation listeners), then verify that rerenders with
    // a new onDrop identity add zero more drag-event listeners.
    const origAdd = HTMLDivElement.prototype.addEventListener;
    const addCalls: string[] = [];
    HTMLDivElement.prototype.addEventListener = function (
      this: HTMLDivElement,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (
        type === "dragenter" ||
        type === "dragleave" ||
        type === "dragover" ||
        type === "drop"
      ) {
        addCalls.push(type);
      }
      return origAdd.call(this, type, listener, options);
    };

    try {
      const { rerender } = render(<Host onDrop={vi.fn()} />);
      // Capture baseline after mount (includes React's own internal
      // event-delegation listeners on the div for drag events).
      const afterMount = addCalls.length;
      // Our effect contributes exactly 4; verify at least those 4 are present.
      expect(afterMount).toBeGreaterThanOrEqual(4);

      rerender(<Host onDrop={vi.fn()} />);
      rerender(<Host onDrop={vi.fn()} />);
      rerender(<Host onDrop={vi.fn()} />);

      // No additional listeners should be attached by rerenders.
      expect(addCalls.length).toBe(afterMount);
    } finally {
      HTMLDivElement.prototype.addEventListener = origAdd;
    }
  });

  it("invokes the latest onDrop after the prop has changed", () => {
    const first = vi.fn();
    const second = vi.fn();
    const ref = React.createRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement | null>;
    const { rerender } = render(<Host onDrop={first} hostRef={ref} />);
    rerender(<Host onDrop={second} hostRef={ref} />);

    const file = new File(["x"], "x.txt", { type: "text/plain" });
    fireEvent(ref.current!, dragEvent("drop", { types: ["Files"], files: [file] }));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("moves listeners to new node when bind is called with a different element (state-based rebind)", async () => {
    // This tests the state-based setBoundNode path: after bind(nodeB), the
    // effect re-runs, detaches from nodeA, and attaches to nodeB.
    function TwoNodes() {
      const { isDragging, bind } = useDragDrop({ onDrop: vi.fn() });
      const [active, setActive] = React.useState<"a" | "b">("a");
      const nodeARef = React.useRef<HTMLDivElement | null>(null);
      const nodeBRef = React.useRef<HTMLDivElement | null>(null);

      // Bind to whichever node is active.
      const bindA = React.useCallback(
        (node: HTMLDivElement | null) => {
          nodeARef.current = node;
          if (active === "a") bind(node);
        },
        [active, bind],
      );
      const bindB = React.useCallback(
        (node: HTMLDivElement | null) => {
          nodeBRef.current = node;
          if (active === "b") bind(node);
        },
        [active, bind],
      );

      return (
        <div>
          <div ref={bindA} data-testid="nodeA" data-state={isDragging ? "dragging" : "idle"} />
          <div ref={bindB} data-testid="nodeB" data-state={isDragging ? "dragging" : "idle"} />
          <button
            data-testid="switch"
            onClick={() => {
              setActive("b");
              bind(nodeBRef.current);
            }}
          >
            switch
          </button>
        </div>
      );
    }

    const { getByTestId } = render(<TwoNodes />);

    // Initially bound to nodeA — dragenter on nodeA sets isDragging.
    fireEvent(getByTestId("nodeA"), dragEvent("dragenter", { types: ["Files"] }));
    expect(getByTestId("nodeA").getAttribute("data-state")).toBe("dragging");

    // Reset by drop.
    const file = new File(["x"], "x.txt");
    fireEvent(getByTestId("nodeA"), dragEvent("drop", { types: ["Files"], files: [file] }));

    // Switch binding to nodeB.
    await act(async () => {
      fireEvent.click(getByTestId("switch"));
    });

    // dragenter on nodeA should have no effect (listeners detached).
    fireEvent(getByTestId("nodeA"), dragEvent("dragenter", { types: ["Files"] }));
    expect(getByTestId("nodeA").getAttribute("data-state")).toBe("idle");

    // dragenter on nodeB should set isDragging.
    fireEvent(getByTestId("nodeB"), dragEvent("dragenter", { types: ["Files"] }));
    expect(getByTestId("nodeB").getAttribute("data-state")).toBe("dragging");
  });

  it("rebinds listeners between renders — drop on the new node fires the latest handler", async () => {
    const onDrop = vi.fn();
    function Host() {
      const { bind } = useDragDrop({ onDrop });
      const [whichNode, setWhichNode] = React.useState<"a" | "b">("a");
      return (
        <>
          <div ref={whichNode === "a" ? bind : null} data-testid="a" />
          <div ref={whichNode === "b" ? bind : null} data-testid="b" />
          <button onClick={() => setWhichNode("b")}>switch</button>
        </>
      );
    }
    const user = userEvent.setup();
    const { getByTestId, getByText } = render(<Host />);
    // Bound to A initially. Click switch — bind now attaches to B.
    await user.click(getByText("switch"));
    // Fire drop on B and assert the latest handler fires.
    const file = new File(["x"], "x.txt", { type: "text/plain" });
    fireEvent(
      getByTestId("b"),
      dragEvent("dragover", { types: ["Files"], files: [file] }),
    );
    fireEvent(
      getByTestId("b"),
      dragEvent("drop", { types: ["Files"], files: [file] }),
    );
    expect(onDrop).toHaveBeenCalled();
  });
});
