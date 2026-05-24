import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { useMergedRef } from "../src/lib/use-merged-ref";

describe("useMergedRef", () => {
  it("assigns to both callback and object refs", () => {
    const callback = vi.fn();
    const object = React.createRef<HTMLDivElement>();

    function Probe() {
      const ref = useMergedRef(callback, object);
      return <div ref={ref} data-testid="probe" />;
    }

    const { getByTestId } = render(<Probe />);
    const node = getByTestId("probe");

    expect(callback).toHaveBeenCalledWith(node);
    expect(object.current).toBe(node);
  });

  it("tolerates null and undefined entries", () => {
    function Probe() {
      const ref = useMergedRef<HTMLDivElement>(null, undefined);
      return <div ref={ref} />;
    }
    expect(() => render(<Probe />)).not.toThrow();
  });

  it("returns a stable callback identity even when input refs change every render", () => {
    const collected: Array<unknown> = [];
    function Probe() {
      // Fresh callback ref on every render — exercises the case where the
      // hook's input list has changing identity. The hook should still
      // return the same callback identity across renders.
      const freshCallback = (_node: HTMLDivElement | null) => {};
      const merged = useMergedRef<HTMLDivElement>(freshCallback);
      collected.push(merged);
      return <div ref={merged} />;
    }
    const { rerender } = render(<Probe />);
    rerender(<Probe />);
    rerender(<Probe />);
    expect(collected).toHaveLength(3);
    expect(collected[0]).toBe(collected[1]);
    expect(collected[1]).toBe(collected[2]);
  });

  it("clears object refs and forwards null on unmount", () => {
    const callback = vi.fn();
    const object = React.createRef<HTMLDivElement>();
    function Probe() {
      const merged = useMergedRef<HTMLDivElement>(callback, object);
      return <div ref={merged} />;
    }
    const { unmount } = render(<Probe />);
    expect(object.current).not.toBeNull();
    expect(callback).toHaveBeenCalled();
    callback.mockClear();
    unmount();
    expect(object.current).toBeNull();
    expect(callback).toHaveBeenCalledWith(null);
  });
});

describe("useMergedRef regressions", () => {
  it("invokes a NEW callback ref with the current node when refs identity changes", () => {
    function Host({ cb }: { cb: (node: HTMLDivElement | null) => void }) {
      const merged = useMergedRef<HTMLDivElement>(cb);
      return <div ref={merged} data-testid="host" />;
    }

    const cb1 = vi.fn();
    const { rerender } = render(<Host cb={cb1} />);
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb1.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);

    const cb2 = vi.fn();
    rerender(<Host cb={cb2} />);
    // cb2 (the new ref) MUST receive the still-mounted node.
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb2.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });

  it("calls a departing callback ref with null when it drops out of the refs array", () => {
    function Host({ cb }: { cb?: (node: HTMLDivElement | null) => void }) {
      const merged = useMergedRef<HTMLDivElement>(cb);
      return <div ref={merged} data-testid="host" />;
    }

    const cb1 = vi.fn();
    const { rerender } = render(<Host cb={cb1} />);
    expect(cb1).toHaveBeenLastCalledWith(expect.any(HTMLDivElement));

    rerender(<Host cb={undefined} />);
    expect(cb1).toHaveBeenLastCalledWith(null);
  });

  it("calls React 19 cleanup function returned from a callback ref on unmount (StrictMode)", () => {
    // Under StrictMode, React 19 mounts and re-mounts the tree, which exercises
    // the cleanup path during the strict double-invoke cycle. The hook must
    // correctly invoke the returned cleanup function on each tear-down. We
    // capture the count before unmount, then verify unmount adds exactly one
    // more cleanup call.
    const cleanup = vi.fn();
    function Host() {
      const merged = useMergedRef<HTMLDivElement>((node) => {
        if (!node) return;
        return cleanup;
      });
      return <div ref={merged} data-testid="host" />;
    }

    const { unmount } = render(
      <React.StrictMode>
        <Host />
      </React.StrictMode>,
    );
    const beforeUnmount = cleanup.mock.calls.length;
    unmount();
    expect(cleanup.mock.calls.length).toBe(beforeUnmount + 1);
  });

  it("swapping the merged ref across rerenders propagates new node to new ref and detaches old", () => {
    // Regression guard for the documented contract: when the parent
    // swaps which ref it passes (refA -> refB), the old ref is cleaned up
    // (sees null last) and the new ref is attached (sees the current node).
    // Does NOT exercise React 18 concurrent aborted-render paths -- RTL
    // can't easily reproduce those. See B1 in the 2026-05-24 review polish
    // wave plan for the concurrent-safety motivation.
    // Track which refs see which nodes
    const seenA: Array<HTMLElement | null> = [];
    const seenB: Array<HTMLElement | null> = [];
    const refA = (n: HTMLElement | null) => {
      seenA.push(n);
    };
    const refB = (n: HTMLElement | null) => {
      seenB.push(n);
    };

    function Comp({ which }: { which: "a" | "b" }) {
      const ref = useMergedRef<HTMLElement>(which === "a" ? refA : refB);
      return <div ref={ref} />;
    }

    const { rerender, unmount } = render(<Comp which="a" />);
    rerender(<Comp which="b" />);

    // After the rerender: refA should be cleaned up (last seen null),
    // refB should be attached (last seen non-null)
    expect(seenA[seenA.length - 1]).toBeNull();
    expect(seenB[seenB.length - 1]).not.toBeNull();
    unmount();
  });

  it("invokes cleanup of a departing callback ref (not null) when it drops out mid-mount", () => {
    const cleanup = vi.fn();
    const cbWithCleanup = vi.fn((node: HTMLDivElement | null) => {
      if (!node) return;
      return cleanup;
    });

    function Host({ cb }: { cb?: (node: HTMLDivElement | null) => void | (() => void) }) {
      const merged = useMergedRef<HTMLDivElement>(cb);
      return <div ref={merged} data-testid="host" />;
    }

    const { rerender } = render(<Host cb={cbWithCleanup} />);
    expect(cleanup).not.toHaveBeenCalled();

    rerender(<Host cb={undefined} />);

    // Cleanup fired — that's the React 19 semantic.
    expect(cleanup).toHaveBeenCalledTimes(1);
    // And the ref was NOT additionally called with null (cleanup replaces it).
    expect(cbWithCleanup).not.toHaveBeenCalledWith(null);
  });

  it("warns in dev when a callback ref returns a non-function value", () => {
    const errSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    function Host() {
      const merged = useMergedRef<HTMLDivElement>((node) => {
        if (!node) return;
        // Forgot to wrap — returns a Promise (object).
        return Promise.resolve() as unknown as void;
      });
      return <div ref={merged} />;
    }
    render(<Host />);
    expect(
      errSpy.mock.calls.some((args) =>
        String(args[0]).includes("non-function value"),
      ),
    ).toBe(true);
    errSpy.mockRestore();
  });
});
