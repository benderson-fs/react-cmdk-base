import * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "../lib/cn";

export interface PromptInputTooltipProps {
  content: React.ReactNode;
  /** Optional keyboard shortcut hint shown after the content in muted text. */
  shortcut?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  children: React.ReactElement;
}

/**
 * Wrap a single child in a Base UI Tooltip. The child is used as the
 * trigger and must accept ref + standard event handlers (any
 * <PromptInput.Button> or native <button> works).
 */
export function PromptInputTooltip({
  content,
  shortcut,
  side = "top",
  className,
  children,
}: PromptInputTooltipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={(triggerProps) =>
          React.cloneElement(
            children,
            triggerProps as Record<string, unknown>,
          )
        }
      />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={6}>
          <Tooltip.Popup
            data-slot="prompt-input-tooltip"
            className={cn("pi-tooltip", className)}
          >
            <span className="pi-tooltip-content">{content}</span>
            {shortcut ? (
              <span className="pi-tooltip-shortcut">{shortcut}</span>
            ) : null}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

PromptInputTooltip.displayName = "PromptInput.Tooltip";
