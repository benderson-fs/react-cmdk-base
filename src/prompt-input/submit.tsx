import * as React from "react";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";
import { usePromptInput, type PromptInputStatus } from "./context";

export interface PromptInputSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Override the status from the Root context. Defaults to `ctx.status`.
   * Useful when the Submit button should reflect a state that's distinct
   * from the rest of the prompt (e.g. retry indicator in a sibling).
   */
  status?: PromptInputStatus;
  onStop?: () => void;
  asChild?: boolean;
  // No `ref` field — provided via React.forwardRef.
}

const STATUS_LABEL: Record<PromptInputStatus, string> = {
  ready: "Send message",
  submitted: "Submitting",
  streaming: "Stop generating",
  error: "Retry",
};

function SendIcon() {
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
    >
      <path d="M9 10L4 15l5 5" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </svg>
  );
}

function SpinnerIcon() {
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
      className="pi-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function ErrorIcon() {
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
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export const PromptInputSubmit = React.forwardRef<
  HTMLButtonElement,
  PromptInputSubmitProps
>(function PromptInputSubmit(
  {
    status: statusProp,
    onStop,
    onClick,
    type,
    className,
    children,
    asChild,
    ...props
  },
  ref,
) {
  const ctx = usePromptInput();
  const status = statusProp ?? ctx.status;
  const isGenerating = status === "submitted" || status === "streaming";
  const stoppable = isGenerating && !!onStop;

  let icon: React.ReactNode;
  if (status === "submitted") icon = <SpinnerIcon />;
  else if (status === "streaming") icon = <StopIcon />;
  else if (status === "error") icon = <ErrorIcon />;
  else icon = <SendIcon />;

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (stoppable) {
        e.preventDefault();
        onStop?.();
        return;
      }
      onClick?.(e);
    },
    [stoppable, onStop, onClick],
  );

  const buttonType = type ?? (stoppable ? "button" : "submit");
  const mergedClassName = cn("pi-submit", className);

  if (asChild) {
    return (
      <Slot
        ref={ref}
        type={buttonType}
        data-slot="prompt-input-submit"
        data-status={status}
        aria-label={STATUS_LABEL[status]}
        onClick={handleClick}
        className={mergedClassName}
        {...props}
      >
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={buttonType}
      data-slot="prompt-input-submit"
      data-status={status}
      aria-label={STATUS_LABEL[status]}
      onClick={handleClick}
      className={mergedClassName}
      {...props}
    >
      {children ?? icon}
    </button>
  );
});

PromptInputSubmit.displayName = "PromptInput.Submit";
