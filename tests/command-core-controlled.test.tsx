import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CommandMenu, useCommandMenu } from "../src";

describe("CommandMenu.Root controlled page", () => {
  it("setPage does not desync pageRef when controller ignores onPageChange", () => {
    const onPageChange = vi.fn();
    function Drill() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("settings")}>drill</button>;
    }
    render(
      <CommandMenu.Root
        open
        onOpenChange={() => {}}
        page="root"
        onPageChange={onPageChange}
      >
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <Drill />
            <CommandMenu.Item value="r">root-item</CommandMenu.Item>
          </CommandMenu.Page>
          <CommandMenu.Page id="settings">
            <CommandMenu.Item value="s">settings-item</CommandMenu.Item>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    fireEvent.click(screen.getByText("drill"));
    expect(screen.getByText("root-item")).toBeInTheDocument();
    fireEvent.click(screen.getByText("drill"));
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });

  it("re-syncs pageRef when controller resets page back to root between drills", () => {
    const onPageChange = vi.fn();
    function Drill() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("settings")}>drill</button>;
    }
    function Reset() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("root")}>reset</button>;
    }
    function Harness() {
      const [page, setPage] = React.useState("root");
      const handleChange = (next: string) => {
        onPageChange(next);
        setPage(next);
      };
      return (
        <CommandMenu.Root
          open
          onOpenChange={() => {}}
          page={page}
          onPageChange={handleChange}
        >
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <Drill />
              <CommandMenu.Item value="r">root-item</CommandMenu.Item>
            </CommandMenu.Page>
            <CommandMenu.Page id="settings">
              <Reset />
              <CommandMenu.Item value="s">settings-item</CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText("drill"));
    fireEvent.click(screen.getByText("reset"));
    fireEvent.click(screen.getByText("drill"));
    expect(onPageChange).toHaveBeenCalledTimes(3);
    expect(onPageChange.mock.calls.map((c) => c[0])).toEqual([
      "settings",
      "root",
      "settings",
    ]);
  });

  it("setPage('root') request fires onPageChange even when consumer holds the current page", () => {
    const onPageChange = vi.fn();
    function ResetButton() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("root")}>reset</button>;
    }
    render(
      <CommandMenu.Root
        open
        onOpenChange={() => {}}
        page="settings"
        onPageChange={onPageChange}
      >
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Item value="r">root-item</CommandMenu.Item>
          </CommandMenu.Page>
          <CommandMenu.Page id="settings">
            <ResetButton />
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    fireEvent.click(screen.getByText("reset"));
    expect(onPageChange).toHaveBeenCalledWith("root");
    // Consumer ignored the request — rendered page stays at "settings".
    expect(screen.getByText("reset")).toBeInTheDocument();
  });

  it("rejected popPage preserves the stack frame for the next accepted popPage", () => {
    // Bug class: popPage used to call pageStack.pop() unconditionally,
    // before setPageRaw fired. If the consumer rejected the request, the
    // stack lost a frame but the page stayed put — the next accepted pop
    // would skip over the intended back-step.
    //
    // Scenario: drill root -> A -> B (stack = ["root", "A"]). Reject pop
    // from B (consumer holds page="B"). Then accept the next pop. With
    // the bug, "A" was already consumed so the user lands on "root".
    // Fixed: "A" stays on the stack until the pop is accepted.
    let rejectNext = false;
    function Drill({ to }: { to: string }) {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage(to)}>drill-{to}</button>;
    }
    function Pop() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.popPage()}>pop</button>;
    }
    function Harness() {
      const [page, setPage] = React.useState("root");
      const handleChange = (next: string) => {
        if (rejectNext) return;
        setPage(next);
      };
      return (
        <CommandMenu.Root
          open
          onOpenChange={() => {}}
          page={page}
          onPageChange={handleChange}
        >
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <Drill to="A" />
            </CommandMenu.Page>
            <CommandMenu.Page id="A">
              <Drill to="B" />
              <Pop />
              <CommandMenu.Item value="a-item">a-item</CommandMenu.Item>
            </CommandMenu.Page>
            <CommandMenu.Page id="B">
              <Pop />
              <CommandMenu.Item value="b-item">b-item</CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText("drill-A"));
    fireEvent.click(screen.getByText("drill-B"));
    // Reject the first pop — stack must NOT consume "A".
    rejectNext = true;
    fireEvent.click(screen.getByText("pop"));
    expect(screen.getByText("b-item")).toBeInTheDocument();
    // Now flip the harness to accept and pop again — must land on "A",
    // not "root" (the bug would have consumed "A" on the rejected click).
    rejectNext = false;
    fireEvent.click(screen.getByText("pop"));
    expect(screen.getByText("a-item")).toBeInTheDocument();
    expect(screen.queryByText("b-item")).not.toBeInTheDocument();
  });

  it("rejected mid-stack setPage does not push a spurious frame onto the back stack", () => {
    // Bug class symmetric to the popPage one: setPage used to push onto
    // pageStack unconditionally. The decisive test must reject a push
    // WHILE pageRef is already off "root" — otherwise the spurious frame
    // (always "root" in a from-root rejection) never triggers the
    // target===current short-circuit on the eventual pop.
    //
    // Scenario: accept drill root -> A (real frame, stack=["root"]).
    // Then reject drill A -> B. With the bug, "A" would have been
    // spuriously pushed and stack=["root","A"]. Then pop: target=
    // stack.top="A", current="A" -> short-circuit, no onPageChange fires
    // and the user appears stuck on A.
    let rejectNext = false;
    const popCalls: string[] = [];
    function DrillA() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("A")}>drill-A</button>;
    }
    function DrillB() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("B")}>drill-B</button>;
    }
    function Pop() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.popPage()}>pop</button>;
    }
    function Harness() {
      const [page, setPage] = React.useState("root");
      const handleChange = (next: string) => {
        popCalls.push(next);
        if (rejectNext) return;
        setPage(next);
      };
      return (
        <CommandMenu.Root
          open
          onOpenChange={() => {}}
          page={page}
          onPageChange={handleChange}
        >
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <DrillA />
            </CommandMenu.Page>
            <CommandMenu.Page id="A">
              <DrillB />
              <Pop />
              <CommandMenu.Item value="a-item">a-item</CommandMenu.Item>
            </CommandMenu.Page>
            <CommandMenu.Page id="B">
              <Pop />
              <CommandMenu.Item value="b-item">b-item</CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText("drill-A"));
    expect(screen.getByText("a-item")).toBeInTheDocument();
    // Reject the A -> B drill. Under the bug this would still push "A"
    // onto the stack.
    rejectNext = true;
    fireEvent.click(screen.getByText("drill-B"));
    expect(screen.getByText("a-item")).toBeInTheDocument();
    // Now pop. Under the bug, stack.top="A", current="A" -> short-
    // circuit (no onPageChange call). Under the fix, stack.top="root",
    // current="A" -> onPageChange("root") fires.
    rejectNext = false;
    const popCallsBefore = popCalls.length;
    fireEvent.click(screen.getByText("pop"));
    expect(popCalls.slice(popCallsBefore)).toEqual(["root"]);
    expect(screen.getByText("drill-A")).toBeInTheDocument();
    expect(screen.queryByText("a-item")).not.toBeInTheDocument();
  });

  it("rejected setPage does not leave a stale push flag for a later external reset", async () => {
    // Bug class: pendingStackOpRef used to be a plain string ("push" |
    // "pop" | null). When the consumer rejected a controlled setPage,
    // the flag stayed set and the NEXT unrelated page change (e.g. an
    // external consumer-driven reset) would pick it up and push a stale
    // frame onto the stack. The stale frame is invisible until the user
    // navigates deeper and pops past root — at which point the popPage
    // fallback to "root" stops masking the corrupted state.
    //
    // Scenario:
    //   1. Drill root -> A -> B (accepted, stack = ["root", "A"]).
    //   2. Reject internal setPage("C") from B (stale "push" flag).
    //   3. Consumer externally resets page to "root".
    //      - Under bug: stale flag pushes prev="B"; stack = ["root","A","B"].
    //      - Under fix: requested-target tag mismatch ("C" !== "root")
    //        skips the push; internal-nav flag is false so clear-on-root
    //        fires and clears the stack to [].
    //   4. Drill root -> X (accepted).
    //      - Bug stack: ["root","A","B","root"]. Fix stack: ["root"].
    //   5. Pop from X — both reach root via stack.top="root".
    //   6. Pop again from root.
    //      - Bug: stack.top="B" => onPageChange("B"); consumer moves to B.
    //      - Fix: stack empty, target="root" (fallback), current="root"
    //        -> short-circuit, no onPageChange.
    let rejectNext = false;
    let setExternalPage: ((next: string) => void) | null = null;
    function Drill({ to }: { to: string }) {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage(to)}>drill-{to}</button>;
    }
    function Pop() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.popPage()}>pop</button>;
    }
    function Harness() {
      const [page, setPage] = React.useState("root");
      setExternalPage = setPage;
      const handleChange = (next: string) => {
        if (rejectNext) return;
        setPage(next);
      };
      return (
        <CommandMenu.Root
          open
          onOpenChange={() => {}}
          page={page}
          onPageChange={handleChange}
        >
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <Drill to="A" />
              <Drill to="X" />
              <Pop />
            </CommandMenu.Page>
            <CommandMenu.Page id="A">
              <Drill to="B" />
              <CommandMenu.Item value="a-item">a-item</CommandMenu.Item>
            </CommandMenu.Page>
            <CommandMenu.Page id="B">
              <Drill to="C" />
              <CommandMenu.Item value="b-item">b-item</CommandMenu.Item>
            </CommandMenu.Page>
            <CommandMenu.Page id="X">
              <Pop />
              <CommandMenu.Item value="x-item">x-item</CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    render(<Harness />);
    // 1. Drill root -> A -> B.
    fireEvent.click(screen.getByText("drill-A"));
    fireEvent.click(screen.getByText("drill-B"));
    expect(screen.getByText("b-item")).toBeInTheDocument();
    // 2. Reject internal drill B -> C (stale push flag in pre-fix code).
    rejectNext = true;
    fireEvent.click(screen.getByText("drill-C"));
    expect(screen.getByText("b-item")).toBeInTheDocument();
    rejectNext = false;
    // 3. External reset to root.
    act(() => {
      setExternalPage!("root");
    });
    expect(screen.getByText("drill-A")).toBeInTheDocument();
    // 4. Drill root -> X.
    fireEvent.click(screen.getByText("drill-X"));
    expect(screen.getByText("x-item")).toBeInTheDocument();
    // 5. Pop from X (lands at root in both bug + fix).
    fireEvent.click(screen.getByText("pop"));
    expect(screen.getByText("drill-A")).toBeInTheDocument();
    // 6. Pop again from root. Under the bug, the stale "B" frame on
    //    the back stack would now drive onPageChange("B"). Under the
    //    fix, stack is empty and the pop short-circuits.
    fireEvent.click(screen.getByText("pop"));
    expect(screen.getByText("drill-A")).toBeInTheDocument();
    expect(screen.queryByText("b-item")).not.toBeInTheDocument();
  });

  it("popPage does not desync pageRef when controller rejects the pop", () => {
    // Symmetric to the first setPage test in this file, but for popPage.
    // Scenario: harness accepts drill (page moves to "settings") but rejects
    // pop (page stays at "settings"). If popPage speculatively writes
    // pageRef.current = "root" in controlled mode (the bug), then the next
    // drill sees a stale ref ("root" instead of "settings") and emits a
    // spurious onPageChange("settings") request even though the rendered
    // page is already "settings". The correct behavior: the drill notices
    // id === current and short-circuits silently.
    const onPageChange = vi.fn();
    function Drill() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("settings")}>drill</button>;
    }
    function Pop() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.popPage()}>pop</button>;
    }
    function Harness() {
      const [page, setPage] = React.useState("root");
      const handleChange = (next: string) => {
        onPageChange(next);
        // Accept drill (root -> settings), reject pop (settings -> root).
        if (next === "settings") setPage(next);
      };
      return (
        <CommandMenu.Root
          open
          onOpenChange={() => {}}
          page={page}
          onPageChange={handleChange}
        >
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <Drill />
              <CommandMenu.Item value="r">root-item</CommandMenu.Item>
            </CommandMenu.Page>
            <CommandMenu.Page id="settings">
              <Pop />
              <Drill />
              <CommandMenu.Item value="s">settings-item</CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    render(<Harness />);
    // 1. Drill: root -> settings, accepted.
    fireEvent.click(screen.getByText("drill"));
    // 2. Pop: requests root, harness rejects, rendered page stays at settings.
    fireEvent.click(screen.getByText("pop"));
    // 3. Drill again: pageRef must still be "settings". If popPage had
    //    speculatively written it to "root", this would fire a spurious
    //    onPageChange("settings") and we'd see 3 calls instead of 2.
    fireEvent.click(screen.getByText("drill"));
    expect(onPageChange.mock.calls.map((c) => c[0])).toEqual([
      "settings",
      "root",
    ]);
  });
});
