/**
 * True when the bundle is not built for production. Bundlers typically
 * dead-code-eliminate the inverse branch when this is referenced inside
 * an `if (isDev()) { ... }` guard.
 *
 * Safe to call in browsers that have no `process` shim — returns `true`
 * (developer-friendly default) when `process.env.NODE_ENV` cannot be read.
 */
export function isDev(): boolean {
  const env = (
    globalThis as { process?: { env?: { NODE_ENV?: string } } }
  ).process?.env?.NODE_ENV;
  return env !== "production";
}
