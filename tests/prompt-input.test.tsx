import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { PromptInput } from "../src";

function BasicHarness({
  onSubmit,
}: {
  onSubmit: (msg: { text: string; files: unknown[] }) => void;
}) {
  return (
    <PromptInput.Root onSubmit={onSubmit}>
      <PromptInput.Body>
        <PromptInput.Textarea />
      </PromptInput.Body>
      <PromptInput.Footer>
        <PromptInput.Tools />
        <PromptInput.Submit />
      </PromptInput.Footer>
    </PromptInput.Root>
  );
}

describe("PromptInput", () => {
  it("submits text on Enter and clears the textarea", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<BasicHarness onSubmit={onSubmit} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "hello world");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      text: "hello world",
      files: [],
    });
    expect(textarea).toHaveValue("");
  });

  it("does not submit on Shift+Enter and inserts a newline", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<BasicHarness onSubmit={onSubmit} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "line1");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(textarea, "line2");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("line1\nline2");
  });

  it("adds and removes file attachments", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    function Harness() {
      return (
        <PromptInput.Root onSubmit={onSubmit} multiple>
          <PromptInput.Attachments />
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput.Root>
      );
    }

    const { container } = render(<Harness />);
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const file = new File(["abc"], "notes.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(await screen.findByText("notes.txt")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Remove notes.txt"));
    expect(screen.queryByText("notes.txt")).toBeNull();
  });

  it("Submit shows stop affordance during streaming and calls onStop", async () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const user = userEvent.setup();

    render(
      <PromptInput.Root onSubmit={onSubmit}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Submit status="streaming" onStop={onStop} />
        </PromptInput.Footer>
      </PromptInput.Root>,
    );

    const submit = screen.getByRole("button", { name: "Stop generating" });
    expect(submit).toHaveAttribute("type", "button");
    expect(submit).toHaveAttribute("data-status", "streaming");

    await user.click(submit);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Button with pressed renders aria-pressed and data-pressed", () => {
    render(
      <PromptInput.Root onSubmit={() => undefined}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Button pressed>Search</PromptInput.Button>
          <PromptInput.Submit />
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    const btn = screen.getByRole("button", { name: "Search", pressed: true });
    expect(btn).toHaveAttribute("data-pressed", "");
  });

  it("does not submit when status is streaming", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={onSubmit} status="streaming">
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Submit status="streaming" onStop={() => undefined} />
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    await user.type(screen.getByRole("textbox"), "hi");
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toHaveValue("hi");
  });

  it("keeps text + attachments when onSubmit rejects", async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error("server down");
    });
    const user = userEvent.setup();

    function Harness() {
      return (
        <PromptInput.Root onSubmit={onSubmit}>
          <PromptInput.Attachments />
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput.Root>
      );
    }

    const { container } = render(<Harness />);
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(["x"], "x.txt", { type: "text/plain" })] },
    });

    await user.type(screen.getByRole("textbox"), "draft");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("textbox")).toHaveValue("draft");
    expect(screen.getByText("x.txt")).toBeInTheDocument();
  });

  it("fires onError when files are rejected by accept", () => {
    const onError = vi.fn();

    function Harness() {
      return (
        <PromptInput.Root
          onSubmit={() => undefined}
          accept="image/*"
          onError={onError}
        >
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput.Root>
      );
    }

    const { container } = render(<Harness />);
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [new File(["x"], "x.pdf", { type: "application/pdf" })],
      },
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "accept" }),
    );
  });

  it("fires onError when maxFileSize is exceeded", () => {
    const onError = vi.fn();

    function Harness() {
      return (
        <PromptInput.Root
          onSubmit={() => undefined}
          maxFileSize={4}
          onError={onError}
        >
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput.Root>
      );
    }

    const { container } = render(<Harness />);
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [new File(["hello world"], "big.txt", { type: "text/plain" })],
      },
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "max_file_size" }),
    );
  });

  it("respects controlled value via onValueChange", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [v, setV] = React.useState("seed");
      return (
        <>
          <span data-testid="echo">{v}</span>
          <PromptInput.Root
            onSubmit={() => undefined}
            value={v}
            onValueChange={setV}
          >
            <PromptInput.Body>
              <PromptInput.Textarea />
            </PromptInput.Body>
            <PromptInput.Footer>
              <PromptInput.Submit />
            </PromptInput.Footer>
          </PromptInput.Root>
        </>
      );
    }
    render(<Harness />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("seed");
    await user.clear(textarea);
    await user.type(textarea, "next");
    expect(screen.getByTestId("echo")).toHaveTextContent("next");
  });

  it("holding Backspace does not chew through attachments", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    function Harness() {
      return (
        <PromptInput.Root onSubmit={onSubmit} multiple>
          <PromptInput.Attachments />
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput.Root>
      );
    }
    const { container } = render(<Harness />);
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(["a"], "a.txt", { type: "text/plain" }),
          new File(["b"], "b.txt", { type: "text/plain" }),
        ],
      },
    });

    expect(screen.getByText("a.txt")).toBeInTheDocument();
    expect(screen.getByText("b.txt")).toBeInTheDocument();

    const textarea = screen.getByRole("textbox");
    textarea.focus();
    // First Backspace (no repeat) removes the last attachment.
    fireEvent.keyDown(textarea, { key: "Backspace" });
    // A held-key repeat must NOT remove another.
    fireEvent.keyDown(textarea, { key: "Backspace", repeat: true });

    expect(screen.queryByText("b.txt")).toBeNull();
    expect(screen.getByText("a.txt")).toBeInTheDocument();
    // Silence unused warning
    void user;
  });

  it("PromptInputButton spreads data-slot directly onto the rendered <button>", () => {
    render(<PromptInput.Button data-slot="x-test" aria-label="z" />);
    const btn = screen.getByLabelText("z");
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("data-slot")).toBe("x-test");
  });

  it("PromptInput.Button asChild renders the child element with merged props", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Button asChild>
            <a href="/somewhere" onClick={onClick}>
              Go
            </a>
          </PromptInput.Button>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );

    const link = screen.getByRole("link", { name: "Go" });
    expect(link.className).toMatch(/pi-btn/);
    expect(link.getAttribute("href")).toBe("/somewhere");

    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("PromptInput.Button asChild forwards `type` prop to the child", () => {
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Button asChild type="submit">
            <button data-testid="custom-submit-btn">Submit</button>
          </PromptInput.Button>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    expect(
      screen.getByTestId("custom-submit-btn").getAttribute("type"),
    ).toBe("submit");
  });

  it("PromptInput.Submit uses ctx.status when no `status` prop is provided", async () => {
    function Harness() {
      const [status, setStatus] = React.useState<"ready" | "streaming">(
        "streaming",
      );
      return (
        <>
          <PromptInput.Root onSubmit={() => {}} status={status}>
            <PromptInput.Body>
              <PromptInput.Textarea />
            </PromptInput.Body>
            <PromptInput.Footer>
              <PromptInput.Submit onStop={() => setStatus("ready")} />
            </PromptInput.Footer>
          </PromptInput.Root>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);

    const stopBtn = screen.getByRole("button", { name: "Stop generating" });
    expect(stopBtn.getAttribute("data-status")).toBe("streaming");

    await user.click(stopBtn);
    expect(
      screen.getByRole("button", { name: "Send message" }),
    ).toBeInTheDocument();
  });

  it("PromptInput.Submit asChild renders the child element", () => {
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Submit asChild>
            <button data-testid="custom-submit">Send →</button>
          </PromptInput.Submit>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );

    const btn = screen.getByTestId("custom-submit");
    expect(btn.className).toMatch(/pi-submit/);
    expect(btn.getAttribute("type")).toBe("submit");
    expect(btn).toHaveTextContent("Send →");
  });

  // Regression guard for the canonical element-form `render` pattern in
  // Menu.Trigger wrappers. Base UI's Menu opens on `onMouseDown` (and
  // forwards `onPointerDown`), NOT on `onClick`. With the previous
  // function-form render that spread consumer `{...props}` AFTER
  // `{...triggerProps}`, a consumer passing either of those pointer
  // handlers would have silently disabled Base UI's open behavior. The
  // element-form render routes through `mergeProps`, which composes
  // both handler sets. Asserting onClick alone wouldn't catch that bug
  // (Base UI doesn't use onClick to open) — so we exercise the actual
  // pointer-event surface that Base UI relies on.
  it("PromptInput.ActionMenuTrigger composes consumer pointer/mouse/click handlers with Base UI's open handler", async () => {
    const onPointerDown = vi.fn();
    const onMouseDown = vi.fn();
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.ActionMenu>
          <PromptInput.ActionMenuTrigger
            onPointerDown={onPointerDown}
            onMouseDown={onMouseDown}
            onClick={onClick}
          />
          <PromptInput.ActionMenuContent>
            <PromptInput.ActionMenuItem>Item A</PromptInput.ActionMenuItem>
          </PromptInput.ActionMenuContent>
        </PromptInput.ActionMenu>
      </PromptInput.Root>,
    );
    await user.click(screen.getByLabelText("Open actions"));
    // All three consumer handlers fire (mergeProps composes, doesn't overwrite)…
    expect(onPointerDown).toHaveBeenCalled();
    expect(onMouseDown).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
    // …AND Base UI's own open handler still runs.
    expect(
      await screen.findByRole("menuitem", { name: "Item A" }),
    ).toBeInTheDocument();
  });

  describe("PromptInput.ModelSelectTrigger", () => {
    // Same regression guard shape as PromptInput.ActionMenuTrigger.
    // See the comment above that test for why pointer/mouse handlers
    // must be exercised rather than just onClick.
    it("composes consumer pointer/mouse/click handlers with Base UI's open handler", async () => {
      const onPointerDown = vi.fn();
      const onMouseDown = vi.fn();
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <PromptInput.Root onSubmit={() => {}}>
          <PromptInput.ModelSelect>
            <PromptInput.ModelSelectTrigger
              label="GPT"
              onPointerDown={onPointerDown}
              onMouseDown={onMouseDown}
              onClick={onClick}
            />
            <PromptInput.ModelSelectContent>
              <PromptInput.ModelSelectItem value="gpt-4o">GPT-4o</PromptInput.ModelSelectItem>
            </PromptInput.ModelSelectContent>
          </PromptInput.ModelSelect>
        </PromptInput.Root>,
      );
      await user.click(screen.getByLabelText("Model"));
      expect(onPointerDown).toHaveBeenCalled();
      expect(onMouseDown).toHaveBeenCalled();
      expect(onClick).toHaveBeenCalled();
      expect(
        await screen.findByRole("menuitemradio", { name: "GPT-4o" }),
      ).toBeInTheDocument();
    });
  });

  it("PromptInput.ActionMenuItem keepOpen prevents Base UI from closing the menu", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.ActionMenu>
            <PromptInput.ActionMenuTrigger />
            <PromptInput.ActionMenuContent>
              <PromptInput.ActionMenuItem keepOpen onClick={onClick}>
                Sticky
              </PromptInput.ActionMenuItem>
            </PromptInput.ActionMenuContent>
          </PromptInput.ActionMenu>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Open actions" }));
    const sticky = await screen.findByRole("menuitem", { name: "Sticky" });
    await user.click(sticky);

    expect(onClick).toHaveBeenCalledTimes(1);
    // The menu item itself should still be in the document — keepOpen kept the menu open.
    expect(
      screen.queryByRole("menuitem", { name: "Sticky" }),
    ).toBeInTheDocument();
  });

  describe("PromptInputTextarea accessible name", () => {
    it('defaults to "Message" rather than reusing the form label', () => {
      render(
        <PromptInput.Root label="Customer support chat" onSubmit={() => {}}>
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
        </PromptInput.Root>,
      );
      const ta = screen.getByRole("textbox");
      expect(ta).toHaveAttribute("aria-label", "Message");
    });

    it("honours explicit aria-label", () => {
      render(
        <PromptInput.Root onSubmit={() => {}}>
          <PromptInput.Body>
            <PromptInput.Textarea aria-label="Your reply" />
          </PromptInput.Body>
        </PromptInput.Root>,
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-label",
        "Your reply",
      );
    });
  });
});
