import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { PromptInput } from "../src";

function Harness(
  props: Partial<React.ComponentProps<typeof PromptInput.Root>>,
) {
  return (
    <PromptInput.Root onSubmit={() => undefined} {...props}>
      <PromptInput.Body>
        <PromptInput.Textarea />
      </PromptInput.Body>
      <PromptInput.Footer>
        <PromptInput.Submit />
      </PromptInput.Footer>
    </PromptInput.Root>
  );
}

describe("PromptInput collapsible — Root props", () => {
  it("does not set data-collapsible when the prop is absent", () => {
    const { container } = render(<Harness />);
    const root = container.querySelector(".pi-root");
    expect(root).not.toBeNull();
    expect(root).not.toHaveAttribute("data-collapsible");
    expect(root).not.toHaveAttribute("data-collapsed");
  });

  it("sets data-collapsible and defaults to data-collapsed when collapsible", () => {
    const { container } = render(<Harness collapsible />);
    const root = container.querySelector(".pi-root");
    expect(root).toHaveAttribute("data-collapsible", "");
    expect(root).toHaveAttribute("data-collapsed", "");
  });

  it("respects defaultCollapsed={false}", () => {
    const { container } = render(
      <Harness collapsible defaultCollapsed={false} />,
    );
    const root = container.querySelector(".pi-root");
    expect(root).toHaveAttribute("data-collapsible", "");
    expect(root).not.toHaveAttribute("data-collapsed");
  });

  it("respects controlled collapsed={false}", () => {
    const { container } = render(
      <Harness collapsible collapsed={false} onCollapsedChange={vi.fn()} />,
    );
    const root = container.querySelector(".pi-root");
    expect(root).toHaveAttribute("data-collapsible", "");
    expect(root).not.toHaveAttribute("data-collapsed");
  });

  it("respects controlled collapsed={true}", () => {
    const { container } = render(
      <Harness collapsible collapsed={true} onCollapsedChange={vi.fn()} />,
    );
    const root = container.querySelector(".pi-root");
    expect(root).toHaveAttribute("data-collapsed", "");
  });
});
