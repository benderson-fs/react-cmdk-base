import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  CommandMenuRoot,
  CommandMenuInput,
  CommandMenuList,
  CommandMenuGroup,
  CommandMenuItem,
} from "../src";

describe("CommandMenu input row exposes Combobox InputGroup data attributes", () => {
  it("InputGroup state attributes land on the input row wrapper", async () => {
    render(
      <CommandMenuRoot open onOpenChange={() => {}}>
        <CommandMenuInput />
        <CommandMenuList>
          <CommandMenuGroup heading="A">
            <CommandMenuItem value="apple">Apple</CommandMenuItem>
          </CommandMenuGroup>
        </CommandMenuList>
      </CommandMenuRoot>,
    );
    await userEvent.click(screen.getByRole("combobox"));
    const row = document.body.querySelector(".cmdk-input-row");
    // InputGroup sets data-placeholder when no value is selected — confirms
    // the wrapper div receives InputGroup state data-attributes.
    expect(row).toHaveAttribute("data-placeholder");
  });
});
