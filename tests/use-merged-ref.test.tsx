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

  it("calls React 19 cleanup function returned from a callback ref on unmount", () => {
    const cleanup = vi.fn();
    function Host() {
      const merged = useMergedRef<HTMLDivElement>((node) => {
        if (!node) return;
        return cleanup;
      });
      return <div ref={merged} data-testid="host" />;
    }

    const { unmount } = render(<Host />);
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
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
});
