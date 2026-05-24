"use client";

import * as React from "react";
import {
  SearchInput,
  type SearchInputMessage,
} from "react-cmdk-base";

const docs = [
  { id: "useState", title: "useState — React Hook" },
  { id: "useEffect", title: "useEffect — React Hook" },
  { id: "useRef", title: "useRef — React Hook" },
  { id: "useMemo", title: "useMemo — React Hook" },
];

const people = [
  { id: "rachel", name: "Rachel Lee" },
  { id: "rohan", name: "Rohan Patel" },
  { id: "ravi", name: "Ravi Singh" },
];

const scopeLabels: Record<string, string> = {
  all: "All",
  docs: "Docs",
  people: "People",
};

export default function SearchInputDemo() {
  const [status, setStatus] =
    React.useState<"idle" | "submitted" | "streaming" | "error">("idle");
  const [scope, setScope] = React.useState<string>("all");

  const handleSubmit = async (msg: SearchInputMessage) => {
    setStatus("submitted");
    // Simulated async result
    await new Promise((resolve) => setTimeout(resolve, 400));
    setStatus("idle");
    // eslint-disable-next-line no-console
    console.log("submitted:", msg);
  };

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold">SearchInput demo</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Single-line input that expands on hover/focus to show the
          scope picker and submit button. Press Enter (or click the
          submit button) to open the results popover with grouped,
          keyboard-navigable items.
        </p>
      </header>

      <SearchInput.Root
        onSubmit={handleSubmit}
        status={status}
        scope={scope}
        onScopeChange={setScope}
      >
        <SearchInput.Input placeholder="Search docs and people…" />
        <SearchInput.Toolbar>
          <SearchInput.Tools>
            <SearchInput.Picker
              value={scope}
              onValueChange={(v) => setScope(v as string)}
            >
              <SearchInput.PickerTrigger>
                {scopeLabels[scope] ?? "All"}
              </SearchInput.PickerTrigger>
              <SearchInput.PickerContent>
                <SearchInput.PickerItem value="all">All</SearchInput.PickerItem>
                <SearchInput.PickerItem value="docs">Docs</SearchInput.PickerItem>
                <SearchInput.PickerItem value="people">People</SearchInput.PickerItem>
              </SearchInput.PickerContent>
            </SearchInput.Picker>
          </SearchInput.Tools>
          <SearchInput.Submit />
        </SearchInput.Toolbar>

        <SearchInput.Results>
          <SearchInput.Page id="root">
            {(scope === "all" || scope === "docs") && (
              <SearchInput.Group heading="Docs">
                {docs.map((d) => (
                  <SearchInput.Item
                    key={d.id}
                    value={d.id}
                    onSelect={(v) => console.log("selected doc:", v)}
                  >
                    {d.title}
                  </SearchInput.Item>
                ))}
              </SearchInput.Group>
            )}
            {(scope === "all" || scope === "people") && (
              <SearchInput.Group heading="People">
                {people.map((p) => (
                  <SearchInput.Item
                    key={p.id}
                    value={p.id}
                    onSelect={(v) => console.log("selected person:", v)}
                  >
                    {p.name}
                  </SearchInput.Item>
                ))}
              </SearchInput.Group>
            )}
            <SearchInput.Empty>No results.</SearchInput.Empty>
          </SearchInput.Page>
        </SearchInput.Results>
      </SearchInput.Root>
    </main>
  );
}
