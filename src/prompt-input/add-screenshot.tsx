import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { usePromptInput } from "./context";
import { cn } from "../lib/cn";

function MonitorIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pi-menu-item-icon"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

async function captureDisplay(): Promise<File | null> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) return null;
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "NotAllowedError" || name === "AbortError") return null;
    throw err;
  }
  try {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    // Wait one frame so dimensions are populated.
    await new Promise<void>((res) =>
      requestAnimationFrame(() => res()),
    );
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx2d = canvas.getContext("2d");
    if (ctx2d) ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/png"),
    );
    if (!blob) return null;
    return new File([blob], `screenshot-${Date.now()}.png`, {
      type: "image/png",
    });
  } finally {
    for (const track of stream.getTracks()) track.stop();
  }
}

export interface PromptInputAddScreenshotProps
  extends Omit<
    React.ComponentProps<typeof Menu.Item>,
    "children" | "className"
  > {
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function PromptInputAddScreenshot({
  label = "Take screenshot",
  icon,
  className,
  onClick,
  ...props
}: PromptInputAddScreenshotProps) {
  const ctx = usePromptInput();
  return (
    <Menu.Item
      data-slot="prompt-input-add-screenshot"
      className={cn("pi-menu-item", className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        // Fire-and-forget; addFiles handles all the URL bookkeeping.
        void captureDisplay().then((file) => {
          if (file) ctx.addFiles([file]);
        });
      }}
      {...props}
    >
      {icon ?? <MonitorIcon />}
      <span className="pi-menu-item-label">{label}</span>
    </Menu.Item>
  );
}

PromptInputAddScreenshot.displayName = "PromptInput.AddScreenshot";
