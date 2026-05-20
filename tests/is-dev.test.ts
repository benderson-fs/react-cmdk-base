import { describe, it, expect, vi, afterEach } from "vitest";
import { isDev } from "../src/lib/is-dev";

const originalProcess = globalThis.process;

afterEach(() => {
  if (originalProcess) {
    (globalThis as { process?: NodeJS.Process }).process = originalProcess;
  }
  vi.unstubAllEnvs();
});

describe("isDev", () => {
  it("returns true when NODE_ENV is not 'production'", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isDev()).toBe(true);
  });

  it("returns false when NODE_ENV is 'production'", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isDev()).toBe(false);
  });

  it("returns true when process is undefined (browser without shim)", () => {
    (globalThis as { process?: NodeJS.Process }).process =
      undefined as unknown as NodeJS.Process;
    expect(isDev()).toBe(true);
  });
});
