import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { PromptInput } from "../src";

describe("PromptInput.Tooltip", () => {
  it("shows tooltip content on focus of the trigger", async () => {
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tooltip content="Send the message" shortcut="⌘↵">
            <PromptInput.Button>Send</PromptInput.Button>
          </PromptInput.Tooltip>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );

    const btn = screen.getByRole("button", { name: "Send" });
    await user.tab(); // focus the textarea first
    await user.tab(); // then the button
    expect(btn).toHaveFocus();
    // Base UI Tooltip mounts content into a portal on focus.
    expect(
      await screen.findByText("Send the message"),
    ).toBeInTheDocument();
  });

  it("PromptInput.Button `tooltip` prop short-circuits to wrap automatically", () => {
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Button tooltip="Helpful hint">
            Help
          </PromptInput.Button>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    expect(
      screen.getByRole("button", { name: "Help" }),
    ).toBeInTheDocument();
  });
});
