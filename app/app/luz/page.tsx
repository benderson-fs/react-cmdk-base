"use client";

import * as React from "react";
import Link from "next/link";
import { Cog, House, Layers, Plus, Monitor, Globe } from "lucide-react";
import { Toolbar } from "@base-ui/react/toolbar";
import { Select } from "@base-ui/react/select";
import {
  CommandMenu,
  PromptInput,
  type PromptInputMessage,
  type PromptInputStatus,
  useCmdkShortcut,
} from "react-cmdk-base";

const PROJECTS = [
  { id: "northwind", name: "Northwind ledger" },
  { id: "atlas", name: "Atlas pipeline" },
  { id: "polaris", name: "Polaris analytics" },
];

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", chef: "OpenAI" },
  { id: "claude-opus-4", name: "Claude 4 Opus", chef: "Anthropic" },
  { id: "gemini-2-flash", name: "Gemini 2.0 Flash", chef: "Google" },
] as const;

type ModelId = (typeof MODELS)[number]["id"];

const MODEL_LABELS: Record<string, string> = {
  "gpt-4o": "GPT-4o",
  "claude-opus-4": "Claude 4 Opus",
  "gemini-2-flash": "Gemini 2.0 Flash",
};

export default function LuzDemo() {
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState("root");
  const [dark, setDark] = React.useState(false);
  const [model, setModel] = React.useState<ModelId>("gpt-4o");
  const [search, setSearch] = React.useState(false);
  const [status, setStatus] = React.useState<PromptInputStatus>("ready");
  useCmdkShortcut(setOpen);

  // Toggle .dark on <html> so portaled surfaces (menu popup, tooltip) pick it up.
  // Also set data-theme="luz" on documentElement so portaled surfaces inherit it.
  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", "luz");
    if (dark) html.classList.add("dark");
    else html.classList.remove("dark");
    return () => {
      html.removeAttribute("data-theme");
      html.classList.remove("dark");
    };
  }, [dark]);

  const selectedModel = MODELS.find((m) => m.id === model);

  const handleSubmit = React.useCallback(
    async (_message: PromptInputMessage) => {
      setStatus("submitted");
      await new Promise<void>((res) => setTimeout(res, 200));
      setStatus("streaming");
      await new Promise<void>((res) => setTimeout(res, 1500));
      setStatus("ready");
    },
    [],
  );

  const handleStop = React.useCallback(() => setStatus("ready"), []);

  const groups = React.useMemo(() => {
    const out: Record<string, (typeof MODELS)[number][]> = {};
    for (const m of MODELS) (out[m.chef] ??= []).push(m);
    return Object.entries(out);
  }, []);

  return (
    <div
      className={
        dark
          ? "flex flex-1 flex-col bg-black py-16"
          : "flex flex-1 flex-col bg-zinc-50 py-16"
      }
    >
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4">
        <header className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="text-sm underline-offset-4 hover:underline"
            >
              ← back
            </Link>
            <h1
              className={
                dark
                  ? "text-3xl font-light tracking-tight text-white"
                  : "text-3xl font-light tracking-tight text-zinc-900"
              }
            >
              Luz theme demo
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="rounded-md border border-current px-3 py-1.5 text-sm"
          >
            {dark ? "Light" : "Dark"}
          </button>
        </header>

        <section className="flex flex-col gap-3">
          <h2
            className={
              dark
                ? "text-xs font-semibold uppercase tracking-wide text-zinc-400"
                : "text-xs font-semibold uppercase tracking-wide text-zinc-500"
            }
          >
            CommandMenu — Spotlight
          </h2>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="self-start rounded-md border border-current px-4 py-2 text-sm"
          >
            Open command menu
            <span className="ml-2 inline-flex items-center gap-1 text-xs opacity-70">
              <CommandMenu.Kbd>⌘</CommandMenu.Kbd>
              <CommandMenu.Kbd>K</CommandMenu.Kbd>
            </span>
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <h2
            className={
              dark
                ? "text-xs font-semibold uppercase tracking-wide text-zinc-400"
                : "text-xs font-semibold uppercase tracking-wide text-zinc-500"
            }
          >
            PromptInput — Picker (uncontrolled)
          </h2>
          <p
            className={
              dark
                ? "text-sm text-zinc-400"
                : "text-sm text-zinc-600"
            }
          >
            <code>PromptInput.Picker</code> — a lightweight Select wrapper for
            any arbitrary choice (model, tone, language…). Uses{" "}
            <code>defaultValue</code> so no consumer state is needed.
          </p>
          <PromptInput.Root onSubmit={handleSubmit} multiple status={status}>
            <PromptInput.Attachments />
            <PromptInput.Body>
              <PromptInput.Textarea placeholder="Ask anything…" />
            </PromptInput.Body>
            <PromptInput.Footer>
              <PromptInput.Toolbar>
                <PromptInput.ActionMenu>
                  <Toolbar.Button
                    render={<PromptInput.ActionMenuTrigger />}
                  />
                  <PromptInput.ActionMenuContent>
                    <PromptInput.AddAttachments label="Add photos or files" />
                    <PromptInput.ActionMenuItem
                      onClick={() => alert("(Demo) Take screenshot")}
                    >
                      <Monitor className="pi-menu-item-icon" />
                      <span className="pi-menu-item-label">Take screenshot</span>
                    </PromptInput.ActionMenuItem>
                  </PromptInput.ActionMenuContent>
                </PromptInput.ActionMenu>

                <Toolbar.Button
                  render={
                    <PromptInput.Button
                      pressed={search}
                      onClick={() => setSearch((s) => !s)}
                    >
                      <Globe />
                      <span>Search</span>
                    </PromptInput.Button>
                  }
                />

                {/* PromptInput.Picker — uncontrolled, trigger label auto-updates via Select.Value render-prop */}
                <PromptInput.Picker defaultValue="gpt-4o">
                  <Toolbar.Button
                    render={
                      <PromptInput.PickerTrigger aria-label="Model">
                        <Select.Value>
                          {(v) => MODEL_LABELS[v as string] ?? String(v)}
                        </Select.Value>
                      </PromptInput.PickerTrigger>
                    }
                  />
                  <PromptInput.PickerContent aria-label="Model">
                    <PromptInput.PickerItem value="gpt-4o">GPT-4o</PromptInput.PickerItem>
                    <PromptInput.PickerItem value="claude-opus-4">Claude 4 Opus</PromptInput.PickerItem>
                    <PromptInput.PickerItem value="gemini-2-flash">Gemini 2.0 Flash</PromptInput.PickerItem>
                  </PromptInput.PickerContent>
                </PromptInput.Picker>
              </PromptInput.Toolbar>

              <PromptInput.Submit onStop={handleStop} />
            </PromptInput.Footer>
          </PromptInput.Root>
        </section>

        <section className="flex flex-col gap-3">
          <h2
            className={
              dark
                ? "text-xs font-semibold uppercase tracking-wide text-zinc-400"
                : "text-xs font-semibold uppercase tracking-wide text-zinc-500"
            }
          >
            PromptInput — ModelSelect (collapsible)
          </h2>
          <p
            className={
              dark
                ? "text-sm text-zinc-400"
                : "text-sm text-zinc-600"
            }
          >
            Hover or focus to expand. Move the cursor away while empty (or hit
            Escape) to collapse back to a single row. Submit stays visible
            either way.
          </p>
          <PromptInput.Root
            onSubmit={handleSubmit}
            multiple
            status={status}
            collapsible
          >
            <PromptInput.Attachments />
            <PromptInput.Body>
              <PromptInput.Textarea placeholder="Ask anything…" />
            </PromptInput.Body>
            <PromptInput.Footer>
              <PromptInput.Toolbar>
                <PromptInput.ActionMenu>
                  <Toolbar.Button
                    render={<PromptInput.ActionMenuTrigger />}
                  />
                  <PromptInput.ActionMenuContent>
                    <PromptInput.AddAttachments label="Add photos or files" />
                    <PromptInput.ActionMenuItem
                      onClick={() => alert("(Demo) Take screenshot")}
                    >
                      <Monitor className="pi-menu-item-icon" />
                      <span className="pi-menu-item-label">Take screenshot</span>
                    </PromptInput.ActionMenuItem>
                  </PromptInput.ActionMenuContent>
                </PromptInput.ActionMenu>

                <Toolbar.Button
                  render={
                    <PromptInput.Button
                      pressed={search}
                      onClick={() => setSearch((s) => !s)}
                    >
                      <Globe />
                      <span>Search</span>
                    </PromptInput.Button>
                  }
                />

                <PromptInput.ModelSelect
                  value={model}
                  onValueChange={(v) => setModel(v as ModelId)}
                >
                  <Toolbar.Button
                    render={
                      <PromptInput.ModelSelectTrigger
                        label={selectedModel?.name ?? "Model"}
                      />
                    }
                  />
                  <PromptInput.ModelSelectContent>
                    {groups.map(([chef, items]) => (
                      <div key={chef}>
                        <div className="px-2 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wide opacity-60">
                          {chef}
                        </div>
                        {items.map((m) => (
                          <PromptInput.ModelSelectItem
                            key={m.id}
                            value={m.id}
                          >
                            {m.name}
                          </PromptInput.ModelSelectItem>
                        ))}
                      </div>
                    ))}
                  </PromptInput.ModelSelectContent>
                </PromptInput.ModelSelect>
              </PromptInput.Toolbar>

              <PromptInput.Submit onStop={handleStop} />
            </PromptInput.Footer>
          </PromptInput.Root>
        </section>

        <section className="flex flex-col gap-3">
          <h2
            className={
              dark
                ? "text-xs font-semibold uppercase tracking-wide text-zinc-400"
                : "text-xs font-semibold uppercase tracking-wide text-zinc-500"
            }
          >
            Tailwind utilities — luz palette
          </h2>
          <p
            className={
              dark
                ? "text-sm text-zinc-400"
                : "text-sm text-zinc-600"
            }
          >
            These swatches use the <code>@theme</code> tokens registered by{" "}
            <code>react-cmdk-base/themes/luz-palette.css</code> — no inline
            styles, just utility classes.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-luz-button bg-luz-product-purple-700 px-3 py-1.5 text-sm font-medium text-luz-base-white">
              purple-700
            </span>
            <span className="rounded-luz-button bg-luz-product-purple-accent px-3 py-1.5 text-sm font-medium text-luz-base-white">
              purple-accent
            </span>
            <span className="rounded-luz-button bg-luz-product-green-500 px-3 py-1.5 text-sm font-medium text-luz-base-white">
              green-500
            </span>
            <span className="rounded-luz-button bg-luz-product-red-500 px-3 py-1.5 text-sm font-medium text-luz-base-white">
              red-500
            </span>
            <span className="rounded-luz-button bg-luz-product-yellow-500 px-3 py-1.5 text-sm font-medium text-luz-base-black">
              yellow-500
            </span>
            <span className="rounded-luz-button bg-luz-brand-blue-500 px-3 py-1.5 text-sm font-medium text-luz-base-white">
              brand-blue
            </span>
            <span className="rounded-luz-button bg-luz-base-gray-active px-3 py-1.5 text-sm font-medium text-luz-base-gray-dark">
              gray-active
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <div className="rounded-luz-toolbar bg-luz-base-white px-4 py-3 shadow-luz-heavy">
              <span className="text-luz-base-gray-dark text-sm font-medium">
                rounded-luz-toolbar + shadow-luz-heavy
              </span>
            </div>
            <div className="rounded-luz-button bg-luz-base-white px-4 py-3 shadow-luz-button-secondary">
              <span className="text-luz-base-gray-dark text-sm font-medium">
                rounded-luz-button + shadow-luz-button-secondary
              </span>
            </div>
          </div>
        </section>
      </main>

      <CommandMenu.Root
        open={open}
        onOpenChange={setOpen}
        page={page}
        onPageChange={setPage}
      >
        <CommandMenu.Input placeholder="Search…" />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group heading="Home">
              <CommandMenu.Item
                value="home"
                icon={House}
                onSelect={() => setOpen(false)}
              >
                Home
              </CommandMenu.Item>
              <CommandMenu.Item
                value="settings"
                icon={Cog}
                onSelect={() => setOpen(false)}
              >
                Settings
              </CommandMenu.Item>
              <CommandMenu.Item
                value="projects"
                icon={Layers}
                keepOpen
                onSelect={() => setPage("projects")}
                trailing="→"
              >
                Projects
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
          <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
            <CommandMenu.Group heading="Your projects">
              {PROJECTS.map((p) => (
                <CommandMenu.Item
                  key={p.id}
                  value={p.id}
                  icon={Layers}
                  onSelect={() => setOpen(false)}
                >
                  {p.name}
                </CommandMenu.Item>
              ))}
              <CommandMenu.Item
                value="new-project"
                icon={Plus}
                onSelect={() => setOpen(false)}
              >
                Create new project
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
        <CommandMenu.Footer>
          <span>
            <CommandMenu.Kbd>↵</CommandMenu.Kbd> select &nbsp;·&nbsp;
            <CommandMenu.Kbd>esc</CommandMenu.Kbd> close
          </span>
          <span>luz theme</span>
        </CommandMenu.Footer>
      </CommandMenu.Root>
    </div>
  );
}
