import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState } from "react";
import { useCmdkShortcut } from "../src";

describe("useCmdkShortcut", () => {
  it("toggles open on cmd/ctrl+K", () => {
    const { result } = renderHook(() => {
      const [open, setOpen] = useState(false);
      useCmdkShortcut(setOpen);
      return { open };
    });
    expect(result.current.open).toBe(false);
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
          metaKey: true,
        }),
      );
    });
    expect(result.current.open).toBe(true);
  });
});
