import * as React from "react";
import { usePromptInput } from "./context";
import { cn } from "../lib/cn";

export interface PromptInputAttachmentsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, render even with zero attachments (default false). */
  alwaysRender?: boolean;
}

function XIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PromptInputAttachments({
  alwaysRender = false,
  className,
  ...props
}: PromptInputAttachmentsProps) {
  const ctx = usePromptInput();
  if (!alwaysRender && ctx.attachments.length === 0) return null;
  return (
    <div className={cn("pi-attachments", className)} {...props}>
      {ctx.attachments.map((a) => {
        const isImage = a.mediaType.startsWith("image/");
        return (
          <div key={a.id} className="pi-attachment-chip">
            {isImage ? (
              <img
                src={a.url}
                alt={a.filename}
                className="pi-attachment-thumb"
              />
            ) : null}
            <span className="pi-attachment-meta">
              <span className="pi-attachment-name">{a.filename}</span>
              <span className="pi-attachment-size">
                {formatBytes(a.size)}
              </span>
            </span>
            <button
              type="button"
              aria-label={`Remove ${a.filename}`}
              className="pi-attachment-remove"
              onClick={() => ctx.removeFile(a.id)}
            >
              <XIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
}

PromptInputAttachments.displayName = "PromptInput.Attachments";
