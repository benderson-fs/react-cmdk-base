"use client";

import * as React from "react";
import Link from "next/link";
import {
  Cog,
  Code2,
  House,
  LifeBuoy,
  Layers,
  LogOut,
  Plus,
} from "lucide-react";
import { CommandMenu, useCmdkShortcut } from "react-cmdk-base";

const PROJECTS = [
  { id: "northwind", name: "Northwind ledger" },
  { id: "atlas", name: "Atlas pipeline" },
  { id: "polaris", name: "Polaris analytics" },
  { id: "helio", name: "Helio web" },
  { id: "kepler", name: "Kepler infra" },
];

export default function Home() {
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState("root");
  useCmdkShortcut(setOpen);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex max-w-md flex-col items-center gap-6 py-32 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          react-cmdk-base prototype
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          A clean-break rebuild of <code className="font-mono">react-cmdk</code>{" "}
          on Base UI primitives.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Open command menu
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <CommandMenu.Kbd>⌘</CommandMenu.Kbd>
            <CommandMenu.Kbd>K</CommandMenu.Kbd>
          </span>
        </button>
        <Link
          href="/prompt"
          className="text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          → PromptInput demo
        </Link>
        <Link
          href="/luz"
          className="text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          → Luz theme demo
        </Link>
      </main>

      <CommandMenu.Root
        open={open}
        onOpenChange={setOpen}
        page={page}
        onPageChange={setPage}
      >
        <CommandMenu.Input placeholder="Type a command or search…" />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group heading="Home">
              <CommandMenu.Item
                value="home"
                icon={House}
                onSelect={() => console.log("go home")}
              >
                Home
              </CommandMenu.Item>
              <CommandMenu.Item
                value="settings"
                icon={Cog}
                onSelect={() => console.log("settings")}
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

            <CommandMenu.Group heading="Other">
              <CommandMenu.Item
                value="dev-settings"
                icon={Code2}
                onSelect={() => console.log("dev settings")}
              >
                Developer settings
              </CommandMenu.Item>
              <CommandMenu.Item
                value="privacy"
                icon={LifeBuoy}
                onSelect={() => console.log("privacy")}
              >
                Privacy policy
              </CommandMenu.Item>
              <CommandMenu.Item
                value="logout"
                icon={LogOut}
                onSelect={() => alert("Logging out…")}
              >
                Log out
              </CommandMenu.Item>
            </CommandMenu.Group>

            <CommandMenu.FreeSearch
              onSelect={(q) => console.log("free search:", q)}
            />
          </CommandMenu.Page>

          <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
            <CommandMenu.Group heading="Your projects">
              {PROJECTS.map((p) => (
                <CommandMenu.Item
                  key={p.id}
                  value={p.id}
                  icon={Layers}
                  onSelect={() => console.log("open project", p.id)}
                >
                  {p.name}
                </CommandMenu.Item>
              ))}
              <CommandMenu.Item
                value="new-project"
                icon={Plus}
                onSelect={() => console.log("new project")}
              >
                Create new project
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>

        <CommandMenu.Footer>
          <span>
            <CommandMenu.Kbd>↵</CommandMenu.Kbd> select &nbsp;·&nbsp;
            <CommandMenu.Kbd>↑</CommandMenu.Kbd>
            <CommandMenu.Kbd>↓</CommandMenu.Kbd> navigate &nbsp;·&nbsp;
            <CommandMenu.Kbd>esc</CommandMenu.Kbd> close
          </span>
          <span>react-cmdk-base</span>
        </CommandMenu.Footer>
      </CommandMenu.Root>
    </div>
  );
}
