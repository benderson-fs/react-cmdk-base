"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { SearchInput, type SearchInputMessage } from "react-cmdk-base";

const docs = [
  { id: "useState", title: "useState — React Hook" },
  { id: "useEffect", title: "useEffect — React Hook" },
  { id: "useRef", title: "useRef — React Hook" },
  { id: "useMemo", title: "useMemo — React Hook" },
  { id: "useCallback", title: "useCallback — React Hook" },
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

export default function MainDemo() {
  const [scope, setScope] = React.useState<string>("all");
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null);
  const [lastSubmit, setLastSubmit] =
    React.useState<SearchInputMessage | null>(null);

  // Page is Luz light; only the SearchInput is dark.
  // `data-theme="luz"` on <html> themes both inline and portaled luz surfaces
  // without forcing dark. `.dark` is applied locally to the SearchInput
  // wrapper (inline surface) and via className to portaled popups.
  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", "luz");
    return () => {
      html.removeAttribute("data-theme");
    };
  }, []);

  const handleSubmit = (msg: SearchInputMessage) => {
    setLastSubmit(msg);
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-luz-base-gray-background">
      <main className="flex w-full max-w-xl flex-col items-center gap-6 px-6">
        <div className="dark flex w-full justify-center">
          <SearchInput.Root
            onSubmit={handleSubmit}
            scope={scope}
            onScopeChange={setScope}
            selectedValue={selectedValue}
            onSelectedValueChange={setSelectedValue}
            collapsible={false}
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
                  <SearchInput.PickerContent className="dark">
                    <SearchInput.PickerItem value="all">
                      All
                    </SearchInput.PickerItem>
                    <SearchInput.PickerItem value="docs">
                      Docs
                    </SearchInput.PickerItem>
                    <SearchInput.PickerItem value="people">
                      People
                    </SearchInput.PickerItem>
                  </SearchInput.PickerContent>
                </SearchInput.Picker>
              </SearchInput.Tools>
              <SearchInput.Submit>
                <ArrowRight />
              </SearchInput.Submit>
            </SearchInput.Toolbar>
            <SearchInput.ResultsInline className="dark">
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
        </div>

        {lastSubmit ? (
          <pre className="w-full rounded-luz-button bg-luz-base-gray-other p-3 text-xs text-luz-base-gray-dark">
            {JSON.stringify(lastSubmit, null, 2)}
          </pre>
        ) : null}
      </main>
    </div>
  );
}
