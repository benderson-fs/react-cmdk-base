import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as React from "react";
import { renderHook, act, render } from "@testing-library/react";
import { useAttachments } from "../src/lib/use-attachments";

function makeFile(name: string, type = "text/plain", size = 3): File {
  // Build a payload of exactly `size` bytes so File.size matches expectations.
  const payload = "x".repeat(size);
  return new File([payload], name, { type });
}

describe("useAttachments", () => {
  let revoke: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
  });
  afterEach(() => {
    revoke.mockRestore();
  });

  it("starts with an empty attachment list", () => {
    const { result } = renderHook(() =>
      useAttachments({ idPrefix: "p" }),
    );
    expect(result.current.attachments).toEqual([]);
  });

  it("appends accepted files in order", () => {
    const { result } = renderHook(() =>
      useAttachments({ idPrefix: "p" }),
    );
    act(() =>
      result.current.addFiles([makeFile("a.txt"), makeFile("b.txt")]),
    );
    expect(result.current.attachments.map((a) => a.filename)).toEqual([
      "a.txt",
      "b.txt",
    ]);
  });

  it("rejects files outside the accept filter and fires onError", () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAttachments({ accept: "image/*", onError, idPrefix: "p" }),
    );
    act(() =>
      result.current.addFiles([
        makeFile("doc.txt"),
        makeFile("photo.png", "image/png"),
      ]),
    );
    expect(result.current.attachments.map((a) => a.filename)).toEqual([
      "photo.png",
    ]);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "accept" }),
    );
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("rejects files larger than maxFileSize", () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAttachments({ maxFileSize: 2, onError, idPrefix: "p" }),
    );
    act(() => result.current.addFiles([makeFile("a.txt", "text/plain", 5)]));
    expect(result.current.attachments).toEqual([]);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "max_file_size" }),
    );
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("caps the total attachment count at maxFiles", () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAttachments({ maxFiles: 2, onError, idPrefix: "p" }),
    );
    act(() =>
      result.current.addFiles([
        makeFile("a.txt"),
        makeFile("b.txt"),
        makeFile("c.txt"),
      ]),
    );
    expect(result.current.attachments).toHaveLength(2);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "max_files" }),
    );
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("fires onError when maxFiles=0 and any file is added", () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAttachments({ idPrefix: "test", maxFiles: 0, onError }),
    );
    act(() => result.current.addFiles([makeFile("x.txt")]));
    expect(result.current.attachments.length).toBe(0);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "max_files" }),
    );
  });

  it("removeFile drops the entry and defers the URL revoke", async () => {
    const { result } = renderHook(() =>
      useAttachments({ idPrefix: "p" }),
    );
    act(() => result.current.addFiles([makeFile("a.txt")]));
    const id = result.current.attachments[0].id;
    act(() => result.current.removeFile(id));
    expect(result.current.attachments).toEqual([]);
    expect(revoke).not.toHaveBeenCalled();
    // Revoke is deferred via queueMicrotask — wait one microtask.
    await Promise.resolve();
    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it("clearFiles empties the list and revokes every URL", async () => {
    const { result } = renderHook(() =>
      useAttachments({ idPrefix: "p" }),
    );
    act(() =>
      result.current.addFiles([makeFile("a.txt"), makeFile("b.txt")]),
    );
    act(() => result.current.clearFiles());
    expect(result.current.attachments).toEqual([]);
    expect(revoke).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(revoke).toHaveBeenCalledTimes(2);
  });

  it("sweeps remaining URLs on unmount via the deferred revoke path", async () => {
    const { result, unmount } = renderHook(() =>
      useAttachments({ idPrefix: "p" }),
    );
    act(() => result.current.addFiles([makeFile("a.txt")]));
    unmount();
    // Sweep is routed through queueMicrotask so it lands after the commit
    // flush — same pattern as removeFile/clearFiles.
    expect(revoke).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it("removeFile with an unknown id is a no-op", () => {
    const { result } = renderHook(() => useAttachments({ idPrefix: "p" }));
    act(() => result.current.addFiles([makeFile("a.txt")]));
    act(() => result.current.removeFile("does-not-exist"));
    expect(result.current.attachments).toHaveLength(1);
    expect(revoke).not.toHaveBeenCalled();
  });

  it("fires onError exactly once for a maxFiles cap under StrictMode", () => {
    const onError = vi.fn();
    const { result } = renderHook(
      () => useAttachments({ idPrefix: "test", maxFiles: 1, onError }),
      {
        wrapper: ({ children }) => (
          <React.StrictMode>{children}</React.StrictMode>
        ),
      },
    );
    const f1 = makeFile("a.txt");
    const f2 = makeFile("b.txt");
    act(() => result.current.addFiles([f1, f2]));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "max_files" }),
    );
  });

  it("creates Blob URLs exactly once per file under StrictMode", () => {
    const createSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockImplementation(() => "blob:mock");
    const { result } = renderHook(
      () => useAttachments({ idPrefix: "test" }),
      {
        wrapper: ({ children }) => (
          <React.StrictMode>{children}</React.StrictMode>
        ),
      },
    );
    const file = makeFile("x.txt");
    act(() => result.current.addFiles([file]));
    expect(createSpy).toHaveBeenCalledTimes(1);
    createSpy.mockRestore();
  });

  it("addFiles/removeFile/clearFiles callback identity is stable across attachment changes", () => {
    const { result, rerender } = renderHook(() =>
      useAttachments({ idPrefix: "test" }),
    );
    const firstAdd = result.current.addFiles;
    const firstRemove = result.current.removeFile;
    const firstClear = result.current.clearFiles;
    const file = makeFile("x.txt");
    act(() => result.current.addFiles([file]));
    rerender();
    expect(result.current.addFiles).toBe(firstAdd);
    expect(result.current.removeFile).toBe(firstRemove);
    expect(result.current.clearFiles).toBe(firstClear);
  });

  describe("useAttachments boundary cases", () => {
    it("accepts file exactly at maxFileSize", () => {
      const { result } = renderHook(() =>
        useAttachments({ idPrefix: "test", maxFileSize: 5 }),
      );
      const file = new File(["12345"], "x.txt", { type: "text/plain" });
      act(() => result.current.addFiles([file]));
      expect(result.current.attachments.length).toBe(1);
    });

    it("rejects file one byte over maxFileSize", () => {
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useAttachments({ idPrefix: "test", maxFileSize: 5, onError }),
      );
      const file = new File(["123456"], "x.txt", { type: "text/plain" });
      act(() => result.current.addFiles([file]));
      expect(result.current.attachments.length).toBe(0);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "max_file_size" }),
      );
    });

    it("accepts exactly maxFiles files", () => {
      const { result } = renderHook(() =>
        useAttachments({ idPrefix: "test", maxFiles: 2 }),
      );
      const f1 = new File(["a"], "a.txt", { type: "text/plain" });
      const f2 = new File(["b"], "b.txt", { type: "text/plain" });
      act(() => result.current.addFiles([f1, f2]));
      expect(result.current.attachments.length).toBe(2);
    });

    it("rejects the overflow file when maxFiles is exceeded", () => {
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useAttachments({ idPrefix: "test", maxFiles: 2, onError }),
      );
      const f1 = new File(["a"], "a.txt", { type: "text/plain" });
      const f2 = new File(["b"], "b.txt", { type: "text/plain" });
      const f3 = new File(["c"], "c.txt", { type: "text/plain" });
      act(() => result.current.addFiles([f1, f2, f3]));
      expect(result.current.attachments.length).toBe(2);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "max_files" }),
      );
    });
  });

  it("does not double-revoke under React.StrictMode", async () => {
    function HostHarness({ onState }: { onState: (state: ReturnType<typeof useAttachments>) => void }) {
      const s = useAttachments({ idPrefix: "p" });
      React.useEffect(() => onState(s));
      return null;
    }

    let state: ReturnType<typeof useAttachments> | undefined;
    const captureState = (s: typeof state) => {
      state = s;
    };

    render(
      <React.StrictMode>
        <HostHarness onState={captureState} />
      </React.StrictMode>,
    );

    act(() => state!.addFiles([makeFile("a.txt")]));
    const id = state!.attachments[0].id;
    act(() => state!.removeFile(id));
    await Promise.resolve();

    // Even under StrictMode (where updaters run twice), revoke fires exactly once.
    expect(revoke).toHaveBeenCalledTimes(1);
  });
});
