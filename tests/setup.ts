import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

if (typeof URL.createObjectURL !== "function") {
  // jsdom doesn't implement these; PromptInput uses them for attachment previews.
  let counter = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (URL as any).createObjectURL = () => `blob:mock/${++counter}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (URL as any).revokeObjectURL = () => undefined;
}

afterEach(() => cleanup());
