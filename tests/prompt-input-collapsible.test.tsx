import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

describe("PromptInput collapsible — child hidden propagation", () => {
  function FullHarness(
    props: Partial<React.ComponentProps<typeof PromptInput.Root>>,
  ) {
    return (
      <PromptInput.Root onSubmit={() => undefined} {...props}>
        <PromptInput.Attachments alwaysRender data-testid="attachments" />
        <PromptInput.Header data-testid="header">header</PromptInput.Header>
        <PromptInput.Body data-testid="body">
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer data-testid="footer">
          <PromptInput.Tools data-testid="tools">tools</PromptInput.Tools>
        </PromptInput.Footer>
        <PromptInput.Submit />
      </PromptInput.Root>
    );
  }

  it("hides Header, Footer, Tools, and Attachments when collapsed", () => {
    render(
      <FullHarness collapsible collapsed onCollapsedChange={() => undefined} />,
    );
    expect(screen.getByTestId("header")).toHaveAttribute("hidden");
    expect(screen.getByTestId("footer")).toHaveAttribute("hidden");
    expect(screen.getByTestId("tools")).toHaveAttribute("hidden");
    expect(screen.getByTestId("attachments")).toHaveAttribute("hidden");
  });

  it("does NOT hide Body or the Submit/Textarea pair when collapsed", () => {
    render(
      <FullHarness collapsible collapsed onCollapsedChange={() => undefined} />,
    );
    expect(screen.getByTestId("body")).not.toHaveAttribute("hidden");
    expect(screen.getByRole("textbox")).not.toHaveAttribute("hidden");
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).not.toHaveAttribute("hidden");
  });

  it("does not set hidden when expanded", () => {
    render(<FullHarness collapsible defaultCollapsed={false} />);
    expect(screen.getByTestId("header")).not.toHaveAttribute("hidden");
    expect(screen.getByTestId("footer")).not.toHaveAttribute("hidden");
    expect(screen.getByTestId("attachments")).not.toHaveAttribute("hidden");
  });

  it("does not set hidden when collapsible is off (collapsed prop ignored)", () => {
    render(<FullHarness collapsed />);
    expect(screen.getByTestId("header")).not.toHaveAttribute("hidden");
    expect(screen.getByTestId("footer")).not.toHaveAttribute("hidden");
  });
});

describe("PromptInput collapsible — stylesheet hooks", () => {
  const css = readFileSync(
    resolve(__dirname, "../src/styles.css"),
    "utf8",
  );

  it("references data-collapsed in a .pi-root selector", () => {
    expect(css).toMatch(/\.pi-root\[[^\]]*data-collapsible[^\]]*\]\[data-collapsed\]/);
  });

  it("references data-collapsible in a .pi-root selector", () => {
    expect(css).toMatch(/\.pi-root\[data-collapsible\]/);
  });

  it("respects prefers-reduced-motion", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});

describe("PromptInput collapsible — hover/focus triggers", () => {
  function ControlledHarness({
    onCollapsedChange,
  }: {
    onCollapsedChange: (next: boolean) => void;
  }) {
    const [collapsed, setCollapsed] = React.useState(true);
    return (
      <PromptInput.Root
        onSubmit={() => undefined}
        collapsible
        collapsed={collapsed}
        onCollapsedChange={(next) => {
          onCollapsedChange(next);
          setCollapsed(next);
        }}
      >
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Submit />
      </PromptInput.Root>
    );
  }

  it("expands on pointerenter", () => {
    const onCollapsedChange = vi.fn();
    const { container } = render(
      <ControlledHarness onCollapsedChange={onCollapsedChange} />,
    );
    const root = container.querySelector(".pi-root")!;
    fireEvent.pointerEnter(root);
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it("expands on focusin", () => {
    const onCollapsedChange = vi.fn();
    render(<ControlledHarness onCollapsedChange={onCollapsedChange} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.focus(textarea);
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it("collapses on pointerleave when empty + no focus, after debounce", () => {
    vi.useFakeTimers();
    try {
      const onCollapsedChange = vi.fn();
      const { container } = render(
        <ControlledHarness onCollapsedChange={onCollapsedChange} />,
      );
      const root = container.querySelector(".pi-root")!;
      fireEvent.pointerEnter(root);
      onCollapsedChange.mockClear();
      fireEvent.pointerLeave(root);
      expect(onCollapsedChange).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(160);
      });
      expect(onCollapsedChange).toHaveBeenCalledWith(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not collapse on pointerleave when text is non-empty", () => {
    vi.useFakeTimers();
    try {
      const onCollapsedChange = vi.fn();
      const { container } = render(
        <ControlledHarness onCollapsedChange={onCollapsedChange} />,
      );
      const root = container.querySelector(".pi-root")!;
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      fireEvent.pointerEnter(root);
      fireEvent.change(textarea, { target: { value: "hello" } });
      onCollapsedChange.mockClear();
      fireEvent.pointerLeave(root);
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(onCollapsedChange).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("collapses on Escape when empty + textarea focused", () => {
    const onCollapsedChange = vi.fn();
    render(<ControlledHarness onCollapsedChange={onCollapsedChange} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.focus(textarea);
    onCollapsedChange.mockClear();
    fireEvent.keyDown(textarea, { key: "Escape" });
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("does not collapse on Escape when text is non-empty", () => {
    const onCollapsedChange = vi.fn();
    render(<ControlledHarness onCollapsedChange={onCollapsedChange} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: "hi" } });
    onCollapsedChange.mockClear();
    fireEvent.keyDown(textarea, { key: "Escape" });
    expect(onCollapsedChange).not.toHaveBeenCalled();
  });
});
