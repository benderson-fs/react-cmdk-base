import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toolbar } from "@base-ui/react/toolbar";
import { describe, expect, it, vi } from "vitest";
import {
  PromptInputRoot,
  PromptInputToolbar,
  PromptInputButton,
} from "../src";

describe("PromptInput.Toolbar", () => {
  it("renders a toolbar element with arrow-key roving focus", async () => {
    const onSubmit = vi.fn();
    render(
      <PromptInputRoot onSubmit={onSubmit}>
        <PromptInputToolbar>
          <Toolbar.Button render={<PromptInputButton aria-label="A" />} />
          <Toolbar.Button render={<PromptInputButton aria-label="B" />} />
        </PromptInputToolbar>
      </PromptInputRoot>,
    );
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toBeInTheDocument();
    // Focus the first button directly to avoid tab-order ambiguity with
    // hidden file inputs injected by PromptInput.Root in jsdom
    screen.getByLabelText("A").focus();
    expect(screen.getByLabelText("A")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByLabelText("B")).toHaveFocus();
  });
});
