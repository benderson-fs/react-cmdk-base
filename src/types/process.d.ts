// Minimal ambient declaration so source files can reference
// `process.env.NODE_ENV` (and other env vars) without depending on
// @types/node. Build-time substitution is handled by tsup's `env`
// option in tsup.config.ts; this file only satisfies the type-checker.
//
// `Record<string, string | undefined>` matches Node's runtime contract
// (any string key is allowed, may be undefined) so future references
// don't require widening this type. This file is in `src/types/` and
// is bundled into the single `dist/index.d.ts` artifact by tsup — it
// does NOT leak as a global ambient to consumers of the library.
declare const process: { env: Record<string, string | undefined> };
