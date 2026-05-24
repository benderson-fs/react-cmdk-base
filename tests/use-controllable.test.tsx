import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { useControllable } from "../src/lib/use-controllable";

describe("useControllable", () => {
  describe("uncontrolled mode (prop === undefined)", () => {
    it("returns defaultProp as the initial value", () => {
      const { result } = renderHook(() =>
        useControllable<string>({
          prop: undefined,
          defaultProp: "initial",
        }),
      );
      expect(result.current[0]).toBe("initial");
    });

    it("updates the returned value when setValue is called", () => {
      const { result } = renderHook(() =>
        useControllable<string>({
          prop: undefined,
          defaultProp: "initial",
        }),
      );
      act(() => result.current[1]("next"));
      expect(result.current[0]).toBe("next");
    });

    it("fires onChange when setValue is called", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllable<string>({
          prop: undefined,
          defaultProp: "initial",
          onChange,
        }),
      );
      act(() => result.current[1]("next"));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("next");
    });

    it("supports boolean defaults", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllable<boolean>({
          prop: undefined,
          defaultProp: true,
          onChange,
        }),
      );
      expect(result.current[0]).toBe(true);
      act(() => result.current[1](false));
      expect(result.current[0]).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("reads defaultProp only on first render", () => {
      const { result, rerender } = renderHook(
        ({ def }: { def: string }) =>
          useControllable<string>({
            prop: undefined,
            defaultProp: def,
          }),
        { initialProps: { def: "first" } },
      );
      expect(result.current[0]).toBe("first");
      rerender({ def: "second" });
      // defaultProp changes should NOT alter the live value once mounted.
      expect(result.current[0]).toBe("first");
    });
  });

  describe("controlled mode (prop defined)", () => {
    it("returns the prop value, not the internal state", () => {
      const { result } = renderHook(() =>
        useControllable<string>({
          prop: "controlled",
          defaultProp: "default",
        }),
      );
      expect(result.current[0]).toBe("controlled");
    });

    it("tracks updates to prop across rerenders", () => {
      const { result, rerender } = renderHook(
        ({ prop }: { prop: string }) =>
          useControllable<string>({ prop, defaultProp: "default" }),
        { initialProps: { prop: "a" } },
      );
      expect(result.current[0]).toBe("a");
      rerender({ prop: "b" });
      expect(result.current[0]).toBe("b");
    });

    it("calls onChange but does NOT change the returned value when setValue is called", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllable<string>({
          prop: "controlled",
          defaultProp: "default",
          onChange,
        }),
      );
      act(() => result.current[1]("attempted"));
      // The hook does not own the value in controlled mode — parent must
      // update prop to reflect the change.
      expect(result.current[0]).toBe("controlled");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("attempted");
    });
  });

  describe("switching modes", () => {
    it("returns the controlled prop after switching from undefined to defined", () => {
      const { result, rerender } = renderHook(
        ({ prop }: { prop: string | undefined }) =>
          useControllable<string>({ prop, defaultProp: "default" }),
        { initialProps: { prop: undefined as string | undefined } },
      );
      expect(result.current[0]).toBe("default");
      act(() => result.current[1]("internal-update"));
      expect(result.current[0]).toBe("internal-update");
      // Consumer transitions from uncontrolled to controlled; the controlled
      // value should win on subsequent renders.
      rerender({ prop: "controlled-now" });
      expect(result.current[0]).toBe("controlled-now");
    });

    it("does not fire onChange when the mode toggles between renders", () => {
      const onChange = vi.fn();
      const { rerender } = renderHook(
        ({ prop }: { prop: string | undefined }) =>
          useControllable<string>({
            prop,
            defaultProp: "default",
            onChange,
          }),
        { initialProps: { prop: undefined as string | undefined } },
      );
      onChange.mockClear();
      rerender({ prop: "controlled" });
      rerender({ prop: undefined });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("mode is read at setter-call time", () => {
    it("switching uncontrolled → controlled stops internal writes immediately", () => {
      let onChange = (_: string) => {};
      const { result, rerender } = renderHook(
        ({ prop }: { prop: string | undefined }) =>
          useControllable<string>({
            prop,
            defaultProp: "init",
            onChange,
          }),
        { initialProps: { prop: undefined } },
      );
      // Uncontrolled write
      act(() => result.current[1]("a"));
      expect(result.current[0]).toBe("a");
      // Switch to controlled
      rerender({ prop: "ctrl" });
      expect(result.current[0]).toBe("ctrl");
      // Controlled setter should NOT change internal state
      act(() => result.current[1]("ignored"));
      expect(result.current[0]).toBe("ctrl");
    });
  });

  describe("setValue identity", () => {
    it("is stable across renders when onChange is stable", () => {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(() =>
        useControllable<string>({
          prop: undefined,
          defaultProp: "x",
          onChange,
        }),
      );
      const setterA = result.current[1];
      rerender();
      const setterB = result.current[1];
      expect(setterA).toBe(setterB);
    });

    it("changes when onChange identity changes (tracks onChange dep)", () => {
      const { result, rerender } = renderHook(
        ({ onChange }: { onChange: ((v: string) => void) | undefined }) =>
          useControllable<string>({
            prop: undefined,
            defaultProp: "x",
            onChange,
          }),
        { initialProps: { onChange: vi.fn() as ((v: string) => void) | undefined } },
      );
      const setterA = result.current[1];
      rerender({ onChange: vi.fn() });
      const setterB = result.current[1];
      expect(setterA).not.toBe(setterB);
    });

    it("is stable when consumer wraps onChange with useCallback", () => {
      const handler = vi.fn();
      const { result, rerender } = renderHook(() => {
        const stable = React.useCallback(handler, []);
        return useControllable<string>({
          prop: undefined,
          defaultProp: "x",
          onChange: stable,
        });
      });
      const setterA = result.current[1];
      rerender();
      const setterB = result.current[1];
      expect(setterA).toBe(setterB);
    });
  });
});
