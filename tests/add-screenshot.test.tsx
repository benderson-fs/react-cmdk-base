import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import {
  PromptInput,
  PromptInputRoot,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputAddScreenshot,
} from "../src";

// jsdom doesn't ship navigator.mediaDevices. Stub it for these tests.
function stubMediaDevices(
  getDisplayMedia: (
    constraints?: DisplayMediaStreamOptions,
  ) => Promise<MediaStream>,
) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getDisplayMedia },
  });
}

afterEach(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: undefined,
  });
});

describe("PromptInput.AddScreenshot", () => {
  it("calls getDisplayMedia and adds a PNG attachment on success", async () => {
    const fakeTrack = { stop: vi.fn() };
    const fakeStream = {
      getTracks: () => [fakeTrack],
    } as unknown as MediaStream;
    const getDisplayMedia = vi.fn().mockResolvedValue(fakeStream);
    stubMediaDevices(getDisplayMedia);

    // Stub HTMLCanvasElement.prototype.toBlob to return a fake PNG blob
    // synchronously (jsdom canvas doesn't render).
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (
      cb: BlobCallback,
    ) {
      cb(new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }));
    };

    // Stub HTMLVideoElement.prototype.play (jsdom doesn't implement media playback)
    const originalPlay = HTMLVideoElement.prototype.play;
    HTMLVideoElement.prototype.play = vi
      .fn()
      .mockResolvedValue(undefined) as typeof HTMLVideoElement.prototype.play;

    const user = userEvent.setup();
    function Harness() {
      return (
        <PromptInput.Root onSubmit={() => {}}>
          <PromptInput.Attachments />
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.ActionMenu>
              <PromptInput.ActionMenuTrigger />
              <PromptInput.ActionMenuContent>
                <PromptInput.AddScreenshot label="Screenshot" />
              </PromptInput.ActionMenuContent>
            </PromptInput.ActionMenu>
          </PromptInput.Footer>
        </PromptInput.Root>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Open actions" }));
    const item = await screen.findByRole("menuitem", { name: /Screenshot/ });
    await user.click(item);

    // captureDisplay() awaits requestAnimationFrame (jsdom ~16ms) + toBlob.
    // waitFor retries until the side effects land.
    await waitFor(() => {
      expect(getDisplayMedia).toHaveBeenCalledTimes(1);
      expect(fakeTrack.stop).toHaveBeenCalled();
    });
    expect(
      await screen.findByLabelText(/Remove screenshot/i),
    ).toBeInTheDocument();

    HTMLCanvasElement.prototype.toBlob = originalToBlob;
    HTMLVideoElement.prototype.play = originalPlay;
  });

  it("swallows NotAllowedError silently", async () => {
    const getDisplayMedia = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("Permission denied"), {
          name: "NotAllowedError",
        }),
      );
    stubMediaDevices(getDisplayMedia);

    const user = userEvent.setup();
    function Harness() {
      return (
        <PromptInput.Root onSubmit={() => {}}>
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.ActionMenu>
              <PromptInput.ActionMenuTrigger />
              <PromptInput.ActionMenuContent>
                <PromptInput.AddScreenshot label="Screenshot" />
              </PromptInput.ActionMenuContent>
            </PromptInput.ActionMenu>
          </PromptInput.Footer>
        </PromptInput.Root>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Open actions" }));
    const item = await screen.findByRole("menuitem", { name: /Screenshot/ });

    // Should not throw — error is swallowed.
    await expect(user.click(item)).resolves.not.toThrow();
    expect(getDisplayMedia).toHaveBeenCalled();
  });
});

describe("AddScreenshot error handling", () => {
  it("swallows unexpected errors without an unhandled rejection", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getDisplayMedia: () => Promise.reject(new Error("boom")),
      },
    });
    const onSubmit = vi.fn();
    render(
      <PromptInputRoot onSubmit={onSubmit}>
        <PromptInputActionMenu>
          <PromptInputActionMenuTrigger />
          <PromptInputActionMenuContent>
            <PromptInputAddScreenshot />
          </PromptInputActionMenuContent>
        </PromptInputActionMenu>
      </PromptInputRoot>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: /Take screenshot/ }));
    // Allow the promise rejection to be caught
    await new Promise((res) => setTimeout(res, 10));
    // No throw — test reaches this point cleanly
    expect(true).toBe(true);
    consoleErrorSpy.mockRestore();
  });
});
