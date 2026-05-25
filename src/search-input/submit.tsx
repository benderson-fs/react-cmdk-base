import * as React from "react";
import { cn } from "../lib/cn";
import {
  useSearchInput,
  isInFlight,
  type SearchInputStatus,
} from "./context";

export interface SearchInputSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Override the status from the Root context. Defaults to `ctx.status`.
   * Useful when the Submit button should reflect a state that's distinct
   * from the rest of the search (e.g. retry indicator in a sibling).
   */
  status?: SearchInputStatus;
  onStop?: () => void;
  // No `ref` field — provided via React.forwardRef.
}

const STATUS_LABEL: Record<SearchInputStatus, string> = {
  idle: "Submit search",
  submitted: "Submitting search",
  streaming: "Stop search",
  error: "Retry search",
};

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
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
      className="si-spin"
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

export const SearchInputSubmit = React.forwardRef<
  HTMLButtonElement,
  SearchInputSubmitProps
>(function SearchInputSubmit(
  { status: statusProp, onStop, onClick, type, className, children, ...props },
  ref,
) {
  const ctx = useSearchInput();
  const status = statusProp ?? ctx.status;
  const inFlight = isInFlight(status);
  const stoppable = inFlight && !!onStop;
  // Only disable in the idle empty state — error stays clickable so the
  // button can double as a Retry trigger. In live mode, `selectedValue`
  // also counts as "not empty" so a persistent selection alone is enough
  // to enable the enrich action.
  const isEmptyForSubmit =
    ctx.mode === "live"
      ? ctx.query.length === 0 && ctx.selectedValue == null
      : ctx.query.length === 0;
  const disabledByEmpty = !inFlight && status === "idle" && isEmptyForSubmit;

  let icon: React.ReactNode;
  if (status === "submitted") icon = <SpinnerIcon />;
  else if (status === "streaming") icon = <StopIcon />;
  else if (status === "error") icon = <ErrorIcon />;
  else icon = <SearchIcon />;

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

  // Default to type="submit" so Enter/click triggers form submission, but
  // switch to type="button" while stoppable so clicking the Stop variant
  // doesn't accidentally fire form submission.
  const buttonType = type ?? (stoppable ? "button" : "submit");

  return (
    <button
      ref={ref}
      {...props}
      type={buttonType}
      data-slot="search-input-submit"
      data-status={status}
      aria-label={STATUS_LABEL[status]}
      disabled={disabledByEmpty}
      onClick={handleClick}
      className={cn("si-submit", className)}
    >
      {children ?? icon}
    </button>
  );
});

SearchInputSubmit.displayName = "SearchInput.Submit";
