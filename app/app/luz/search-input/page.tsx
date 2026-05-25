"use client";

import * as React from "react";
import { SearchInput, type SearchInputMessage } from "react-cmdk-base";

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
  // ── Section 1 — inline + scope + selection + submit ────────────────────
  const [scope, setScope] = React.useState<string>("all");
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null);
  const [lastSubmit, setLastSubmit] = React.useState<SearchInputMessage | null>(
    null,
  );

  const handleSubmit = (msg: SearchInputMessage) => {
    setLastSubmit(msg);
    // eslint-disable-next-line no-console
    console.log("enrich:", msg);
  };

  // ── Section 3 — drill-down + clear button ──────────────────────────────
  const [drillPage, setDrillPage] = React.useState<string>("root");
  const [drillQuery, setDrillQuery] = React.useState("");
  const [drillSelected, setDrillSelected] = React.useState<string | null>(null);

  return (
    <main className="mx-auto max-w-2xl space-y-10 p-8">
      {/* ──────────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h1 className="text-xl font-semibold">
          SearchInput — inline (live mode)
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Filter as you type. Enter on a result selects it (label fills the
          input, <code>selectedValue</code> updates). Submit fires the enrich
          action with the current <code>query</code>, <code>scope</code>, and{" "}
          <code>selectedValue</code>.
        </p>
        <SearchInput.Root
          onSubmit={handleSubmit}
          scope={scope}
          onScopeChange={setScope}
          selectedValue={selectedValue}
          onSelectedValueChange={setSelectedValue}
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
          <SearchInput.ResultsInline>
            <SearchInput.Page id="root">
              {(scope === "all" || scope === "docs") && (
                <SearchInput.Group heading="Docs">
                  {docs.map((d) => (
                    <SearchInput.Item key={d.id} value={d.id}>
                      <SearchInput.ItemLabel>{d.title}</SearchInput.ItemLabel>
                    </SearchInput.Item>
                  ))}
                </SearchInput.Group>
              )}
              {(scope === "all" || scope === "people") && (
                <SearchInput.Group heading="People">
                  {people.map((p) => (
                    <SearchInput.Item key={p.id} value={p.id}>
                      <SearchInput.ItemLabel>{p.name}</SearchInput.ItemLabel>
                    </SearchInput.Item>
                  ))}
                </SearchInput.Group>
              )}
              <SearchInput.Empty>No results.</SearchInput.Empty>
            </SearchInput.Page>
          </SearchInput.ResultsInline>
        </SearchInput.Root>
        <div className="space-y-1 text-xs">
          <p>
            selectedValue: <code>{selectedValue ?? "(none)"}</code>
          </p>
          {lastSubmit ? (
            <pre className="rounded bg-neutral-100 p-2 dark:bg-neutral-800">
              {JSON.stringify(lastSubmit, null, 2)}
            </pre>
          ) : null}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          SearchInput — modal (live mode)
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Same model with a dimmed backdrop. The input keeps real focus while
          the panel is open; outside-popup pointer events are blocked by
          Combobox <code>modal=true</code> (the form is inert until the panel
          is dismissed).
        </p>
        <SearchInput.Root onSubmit={handleSubmit} collapsible={false}>
          <SearchInput.Input placeholder="Search…" />
          <SearchInput.Toolbar>
            <SearchInput.Tools />
            <SearchInput.Submit />
          </SearchInput.Toolbar>
          <SearchInput.ResultsModal>
            <SearchInput.Page id="root">
              <SearchInput.Group heading="Docs">
                {docs.map((d) => (
                  <SearchInput.Item key={d.id} value={d.id}>
                    <SearchInput.ItemLabel>{d.title}</SearchInput.ItemLabel>
                  </SearchInput.Item>
                ))}
              </SearchInput.Group>
            </SearchInput.Page>
          </SearchInput.ResultsModal>
        </SearchInput.Root>
      </section>

      {/* ──────────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          SearchInput — drill-down + clear
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          The root items drill into subpages via <code>keepOpen</code>.
          Backspace on the empty popup pops the page stack. The Clear button
          resets query + selection + page.
        </p>
        <SearchInput.Root
          onSubmit={handleSubmit}
          query={drillQuery}
          onQueryChange={setDrillQuery}
          selectedValue={drillSelected}
          onSelectedValueChange={setDrillSelected}
          collapsible={false}
        >
          <SearchInput.Input placeholder="Search…" />
          <SearchInput.Toolbar>
            <SearchInput.Tools>
              <button
                type="button"
                onClick={() => {
                  setDrillQuery("");
                  setDrillSelected(null);
                  setDrillPage("root");
                }}
                className="text-xs underline"
              >
                Clear
              </button>
            </SearchInput.Tools>
            <SearchInput.Submit />
          </SearchInput.Toolbar>
          <SearchInput.ResultsInline>
            <SearchInput.Page id="root">
              <SearchInput.Item
                value="people"
                keepOpen
                onSelect={() => setDrillPage("people")}
              >
                <SearchInput.ItemLabel>People…</SearchInput.ItemLabel>
              </SearchInput.Item>
              <SearchInput.Item
                value="docs"
                keepOpen
                onSelect={() => setDrillPage("docs")}
              >
                <SearchInput.ItemLabel>Docs…</SearchInput.ItemLabel>
              </SearchInput.Item>
            </SearchInput.Page>
            <SearchInput.Page id="people" searchPrefix={["People"]}>
              {people.map((p) => (
                <SearchInput.Item key={p.id} value={p.id}>
                  <SearchInput.ItemLabel>{p.name}</SearchInput.ItemLabel>
                </SearchInput.Item>
              ))}
            </SearchInput.Page>
            <SearchInput.Page id="docs" searchPrefix={["Docs"]}>
              {docs.map((d) => (
                <SearchInput.Item key={d.id} value={d.id}>
                  <SearchInput.ItemLabel>{d.title}</SearchInput.ItemLabel>
                </SearchInput.Item>
              ))}
            </SearchInput.Page>
          </SearchInput.ResultsInline>
        </SearchInput.Root>
        <p className="text-xs">
          drillPage: <code>{drillPage}</code> · drillSelected:{" "}
          <code>{drillSelected ?? "(none)"}</code>
        </p>
      </section>
    </main>
  );
}
