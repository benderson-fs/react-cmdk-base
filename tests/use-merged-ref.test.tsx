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
});
