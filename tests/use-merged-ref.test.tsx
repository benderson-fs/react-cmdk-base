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

  it("returns a stable callback identity across re-renders", () => {
    const collected: Array<unknown> = [];
    function Probe() {
      const objectRef = React.useRef<HTMLDivElement | null>(null);
      const merged = useMergedRef<HTMLDivElement>(objectRef);
      collected.push(merged);
      return <div ref={merged} />;
    }
    const { rerender } = render(<Probe />);
    rerender(<Probe />);
    rerender(<Probe />);
    expect(collected.length).toBe(3);
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
