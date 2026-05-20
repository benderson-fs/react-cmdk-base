"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, Monitor } from "lucide-react";
import {
  PromptInput,
  type PromptInputMessage,
  type PromptInputStatus,
} from "react-cmdk-base";

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", chef: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", chef: "OpenAI" },
  { id: "claude-opus-4", name: "Claude 4 Opus", chef: "Anthropic" },
  { id: "claude-sonnet-4", name: "Claude 4 Sonnet", chef: "Anthropic" },
  { id: "gemini-2-flash", name: "Gemini 2.0 Flash", chef: "Google" },
] as const;

type ModelId = (typeof MODELS)[number]["id"];

const SUBMITTED_MS = 200;
const STREAMING_MS = 2200;

export default function PromptPage() {
  const [model, setModel] = React.useState<ModelId>("gpt-4o");
  const [search, setSearch] = React.useState(false);
  const [status, setStatus] = React.useState<PromptInputStatus>("ready");
  const [log, setLog] = React.useState<
    Array<{ id: number; text: string; files: string[] }>
  >([]);
  const counter = React.useRef(0);

  const selectedModel = MODELS.find((m) => m.id === model);

  const handleSubmit = React.useCallback(
    async (message: PromptInputMessage) => {
      if (!message.text.trim() && message.files.length === 0) return;

      counter.current += 1;
      const entry = {
        id: counter.current,
        text: message.text,
        files: message.files.map((f) => f.filename),
      };
      setLog((prev) => [entry, ...prev]);

      setStatus("submitted");
      await new Promise<void>((res) => setTimeout(res, SUBMITTED_MS));
      setStatus("streaming");
      await new Promise<void>((res) => setTimeout(res, STREAMING_MS));
      setStatus("ready");
    },
    [],
  );

  const handleStop = React.useCallback(() => {
    setStatus("ready");
  }, []);

  const groups = React.useMemo(() => {
    const out: Record<string, typeof MODELS[number][]> = {};
    for (const m of MODELS) {
      (out[m.chef] ??= []).push(m);
    }
    return Object.entries(out);
  }, []);

  return (
    <div className="flex flex-1 items-start justify-center bg-zinc-50 py-16 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-4">
        <header className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm text-zinc-500 underline-offset-4 hover:underline"
          >
            ← back
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            PromptInput
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            AI-Elements-style prompt composer built on Base UI primitives. Enter
            submits, Shift+Enter newlines, files drop in.
          </p>
        </header>

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
                      <div className="px-2 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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

            <PromptInput.Submit status={status} onStop={handleStop} />
          </PromptInput.Footer>
        </PromptInput.Root>

        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Submitted
          </h2>
          {log.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nothing yet. Try typing a message and pressing{" "}
              <kbd className="cmdk-kbd">↵</kbd>.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {log.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="text-zinc-900 dark:text-zinc-100">
                    {entry.text || (
                      <em className="text-zinc-500">(no text)</em>
                    )}
                  </div>
                  {entry.files.length > 0 && (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {entry.files.join(", ")}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
