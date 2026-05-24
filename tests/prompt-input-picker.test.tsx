import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { PromptInput } from "../src";

describe("PromptInput.Picker", () => {
  it("renders trigger with listbox semantics on open", async () => {
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tools>
            <PromptInput.Picker defaultValue="a">
              <PromptInput.PickerTrigger aria-label="Model" label="Model A" />
              <PromptInput.PickerContent aria-label="Model">
                <PromptInput.PickerItem value="a">Model A</PromptInput.PickerItem>
                <PromptInput.PickerItem value="b">Model B</PromptInput.PickerItem>
              </PromptInput.PickerContent>
            </PromptInput.Picker>
          </PromptInput.Tools>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    await user.click(screen.getByRole("combobox", { name: "Model" }));
    expect(
      await screen.findByRole("option", { name: "Model A" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Model B" }),
    ).toBeInTheDocument();
  });

  it("composes consumer pointer/mouse/click handlers with Base UI's open handler", async () => {
    const onPointerDown = vi.fn();
    const onMouseDown = vi.fn();
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tools>
            <PromptInput.Picker>
              <PromptInput.PickerTrigger
                aria-label="Model"
                label="Model A"
                onPointerDown={onPointerDown}
                onMouseDown={onMouseDown}
                onClick={onClick}
              />
              <PromptInput.PickerContent aria-label="Model">
                <PromptInput.PickerItem value="a">Model A</PromptInput.PickerItem>
              </PromptInput.PickerContent>
            </PromptInput.Picker>
          </PromptInput.Tools>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    await user.click(screen.getByRole("combobox", { name: "Model" }));
    expect(onPointerDown).toHaveBeenCalled();
    expect(onMouseDown).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
    expect(
      await screen.findByRole("option", { name: "Model A" }),
    ).toBeInTheDocument();
  });

  it("fires onValueChange when an item is selected (controlled)", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tools>
            <PromptInput.Picker value="a" onValueChange={onValueChange}>
              <PromptInput.PickerTrigger aria-label="Model" label="Model A" />
              <PromptInput.PickerContent aria-label="Model">
                <PromptInput.PickerItem value="a">Model A</PromptInput.PickerItem>
                <PromptInput.PickerItem value="b">Model B</PromptInput.PickerItem>
              </PromptInput.PickerContent>
            </PromptInput.Picker>
          </PromptInput.Tools>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    await user.click(screen.getByRole("combobox", { name: "Model" }));
    await user.click(await screen.findByRole("option", { name: "Model B" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toBe("b");
  });

  it("honors defaultValue when uncontrolled — Select.Value updates reactively on selection", async () => {
    // Note: Select.Value renders the raw value string (not item label text) when
    // items are provided as children rather than via the `items` prop. The trigger
    // text starts as "b" and updates to "a" after selection — what matters is the
    // reactive update, not the exact display label.
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tools>
            <PromptInput.Picker defaultValue="b">
              <PromptInput.PickerTrigger aria-label="Model" />
              <PromptInput.PickerContent aria-label="Model">
                <PromptInput.PickerItem value="a">Model A</PromptInput.PickerItem>
                <PromptInput.PickerItem value="b">Model B</PromptInput.PickerItem>
              </PromptInput.PickerContent>
            </PromptInput.Picker>
          </PromptInput.Tools>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    // With children-based items, Select.Value shows raw value; confirm it reflects
    // the defaultValue ("b") before interaction.
    expect(screen.getByRole("combobox", { name: "Model" })).toHaveTextContent("b");
    await user.click(screen.getByRole("combobox", { name: "Model" }));
    await user.click(await screen.findByRole("option", { name: "Model A" }));
    // After selecting "Model A" (value "a"), the trigger updates to show "a".
    expect(screen.getByRole("combobox", { name: "Model" })).toHaveTextContent("a");
  });

  it("PromptInput.PickerSeparator renders as a Select.Separator with data-slot", async () => {
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body><PromptInput.Textarea /></PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tools>
            <PromptInput.Picker defaultValue="a" defaultOpen>
              <PromptInput.PickerTrigger aria-label="Pick" label="A" />
              <PromptInput.PickerContent aria-label="Pick">
                <PromptInput.PickerItem value="a">A</PromptInput.PickerItem>
                <PromptInput.PickerSeparator data-testid="sep" />
                <PromptInput.PickerItem value="b">B</PromptInput.PickerItem>
              </PromptInput.PickerContent>
            </PromptInput.Picker>
          </PromptInput.Tools>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    const sep = await screen.findByTestId("sep");
    expect(sep.getAttribute("data-slot")).toBe("prompt-input-picker-separator");
  });

  it("renders Group + GroupLabel with listbox-group semantics", async () => {
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tools>
            <PromptInput.Picker defaultValue="gpt-4o">
              <PromptInput.PickerTrigger aria-label="Model" />
              <PromptInput.PickerContent aria-label="Model">
                <PromptInput.PickerGroup>
                  <PromptInput.PickerGroupLabel>OpenAI</PromptInput.PickerGroupLabel>
                  <PromptInput.PickerItem value="gpt-4o">GPT-4o</PromptInput.PickerItem>
                </PromptInput.PickerGroup>
                <PromptInput.PickerGroup>
                  <PromptInput.PickerGroupLabel>Anthropic</PromptInput.PickerGroupLabel>
                  <PromptInput.PickerItem value="claude">Claude</PromptInput.PickerItem>
                </PromptInput.PickerGroup>
              </PromptInput.PickerContent>
            </PromptInput.Picker>
          </PromptInput.Tools>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    await user.click(screen.getByRole("combobox", { name: "Model" }));
    const groups = await screen.findAllByRole("group");
    expect(groups.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "GPT-4o" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Claude" })).toBeInTheDocument();
  });

  it("supports keyboard navigation (Arrow + Enter)", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tools>
            <PromptInput.Picker defaultValue="a" onValueChange={onValueChange}>
              <PromptInput.PickerTrigger aria-label="Pick" label="A" />
              <PromptInput.PickerContent aria-label="Pick">
                <PromptInput.PickerItem value="a">Item A</PromptInput.PickerItem>
                <PromptInput.PickerItem value="b">Item B</PromptInput.PickerItem>
                <PromptInput.PickerItem value="c">Item C</PromptInput.PickerItem>
              </PromptInput.PickerContent>
            </PromptInput.Picker>
          </PromptInput.Tools>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    const trigger = screen.getByRole("combobox", { name: "Pick" });
    trigger.focus();
    await user.keyboard("{Enter}");
    // Wait for the popup
    await screen.findByRole("option", { name: "Item A" });
    // Navigate down twice (to Item C)
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    // The selection should be Item C
    expect(onValueChange).toHaveBeenCalled();
    const lastCall = onValueChange.mock.calls[onValueChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe("c");
  });
});
