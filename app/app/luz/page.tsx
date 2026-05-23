"use client";

import * as React from "react";
import Link from "next/link";
import { Cog, House, Layers, Plus, Monitor, Globe } from "lucide-react";
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
            PromptInput — FilterToolbar
          </h2>
          <PromptInput.Root onSubmit={handleSubmit} multiple status={status}>
            <PromptInput.Attachments />
            <PromptInput.Body>
              <PromptInput.Textarea placeholder="Ask anything…" />
            </PromptInput.Body>
            <PromptInput.Footer>
              <PromptInput.Tools>
                <PromptInput.ActionMenu>
                  <PromptInput.ActionMenuTrigger />
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

                <PromptInput.Button
                  pressed={search}
                  onClick={() => setSearch((s) => !s)}
                >
                  <Globe />
                  <span>Search</span>
                </PromptInput.Button>

                <PromptInput.ModelSelect
                  value={model}
                  onValueChange={(v) => setModel(v as ModelId)}
                >
                  <PromptInput.ModelSelectTrigger
                    label={selectedModel?.name ?? "Model"}
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
              </PromptInput.Tools>

              <PromptInput.Submit onStop={handleStop} />
            </PromptInput.Footer>
          </PromptInput.Root>
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
