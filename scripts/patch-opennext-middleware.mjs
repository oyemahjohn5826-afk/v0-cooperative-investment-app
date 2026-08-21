// Patch for OpenNext 4.1.0 + @opennextjs/cloudflare 1.20.2 on Cloudflare Workers.
//
// ROOT CAUSE (two layers):
//   1. The generated `.open-next/middleware/handler.mjs` begins with
//      `const require = topLevelCreateRequire(import.meta.url)`. On Cloudflare's
//      workerd runtime `import.meta.url` is `undefined`, so `createRequire(undefined)`
//      throws at module load and the whole worker is rejected (Cloudflare API 10021).
//   2. Even after (1) is fixed, the same module executes
//      `var NextConfig = loadConfig(NEXT_DIR)` ... `loadFunctionsConfigManifest(...)`
//      at top level, each of which does `fs.readFileSync(...)`. The middleware
//      bundle is compiled with esbuild `platform: "neutral"`, so `node:fs` resolves
//      to unenv's throwing stub (`[unenv] fs.readFileSync is not implemented yet!`)
//      on workerd. The server function avoids this because it is built with
//      `platform: "node"` (workerd-native fs), but the middleware is not.
//
//   The app has NO real middleware (middleware-manifest is `{}`), so none of this
//   config loading or `createRequire` is actually needed at runtime. The middleware
//   handler just needs its (small, static) config objects to perform pass-through
//   routing and hand off to the Next server function.
//
// FIX:
//   - Guard `import.meta.url` so the dead `createRequire` line does not throw.
//   - Replace the 9 `fs.readFileSync`-based config loads with the JSON inlined at
//     BUILD TIME (where `fs` works on Node). This removes every runtime `fs` call
//     from the middleware module, so it loads cleanly on workerd.
//
// This is a pure deploy/runtime-compatibility fix. It does NOT touch app auth or
// cookie logic. `.open-next/` is regenerated on every `opennextjs-cloudflare build`,
// which is why this runs as a post-build step (wired into the `pages:build` script).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const middlewareDir = join(root, ".open-next", "middleware");
const handlerPath = join(middlewareDir, "handler.mjs");
const nextDir = join(middlewareDir, ".next");

const GUARD = 'import.meta.url ??= "file:///worker.js";';
const CONFIG_BLOCK_START = 'var NEXT_DIR = path2.join(__dirname, ".next");';
const CONFIG_BLOCK_END =
  'var FunctionsConfigManifest = /* @__PURE__ */ loadFunctionsConfigManifest(NEXT_DIR);';

function readJsonSafe(file, fallback) {
  try {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

function embed(value) {
  // JSON is a valid JS expression; wrap in parens to be safe for any shape.
  return `(${JSON.stringify(value)})`;
}

function main() {
  if (!existsSync(handlerPath)) {
    console.warn(
      `[patch-opennext-middleware] ${handlerPath} not found (build may have failed). Skipping.`
    );
    return;
  }

  let content = readFileSync(handlerPath, "utf8");

  // --- Layer 1: guard import.meta.url (dead createRequire) ---------------------
  if (!content.includes(GUARD)) {
    content = `${GUARD}\n${content}`;
  }

  // --- Layer 2: inline config, drop all runtime fs.readFileSync ---------------
  if (!content.includes(CONFIG_BLOCK_START) || !content.includes(CONFIG_BLOCK_END)) {
    // Already patched (or build changed shape). Nothing to do for layer 2.
    if (content.includes(GUARD)) {
      console.log("[patch-opennext-middleware] Already patched. Skipping.");
    } else {
      console.warn(
        "[patch-opennext-middleware] Config block markers not found; cannot inline config."
      );
    }
    if (!content.includes("var NextConfig = (")) {
      // If we only applied the guard but not the config block, that's incomplete.
      // But we still bail to avoid corrupting the file.
    }
    return;
  }

  const startIdx = content.indexOf(CONFIG_BLOCK_START);
  const endIdx = content.indexOf(CONFIG_BLOCK_END) + CONFIG_BLOCK_END.length;
  const originalBlock = content.slice(startIdx, endIdx);

  const requiredServerFiles = readJsonSafe(join(nextDir, "required-server-files.json"), {
    config: {},
  });
  const buildId = (() => {
    try {
      return readFileSync(join(nextDir, "BUILD_ID"), "utf-8").trim();
    } catch {
      return "";
    }
  })();
  // loadRoutesManifest transforms the raw routes-manifest.json into the shape the
  // runtime code actually consumes (with `.locales`, `.routes.static`, etc.).
  const rawRoutesManifest = readJsonSafe(join(nextDir, "routes-manifest.json"), {});
  const _dataRoutes = rawRoutesManifest.dataRoutes ?? [];
  const routesManifest = {
    basePath: rawRoutesManifest.basePath,
    rewrites: Array.isArray(rawRoutesManifest.rewrites)
      ? { beforeFiles: [], afterFiles: rawRoutesManifest.rewrites, fallback: [] }
      : {
          beforeFiles: rawRoutesManifest.rewrites?.beforeFiles ?? [],
          afterFiles: rawRoutesManifest.rewrites?.afterFiles ?? [],
          fallback: rawRoutesManifest.rewrites?.fallback ?? [],
        },
    redirects: rawRoutesManifest.redirects ?? [],
    routes: {
      static: rawRoutesManifest.staticRoutes ?? [],
      dynamic: rawRoutesManifest.dynamicRoutes ?? [],
    },
    locales: rawRoutesManifest.i18n?.locales ?? [],
  };
  const prerenderManifest = readJsonSafe(
    join(nextDir, "prerender-manifest.json"),
    undefined
  );
  const pagesManifest = readJsonSafe(join(nextDir, "server", "pages-manifest.json"), {});
  const middlewareManifest = readJsonSafe(
    join(nextDir, "server", "middleware-manifest.json"),
    { version: 3, middleware: {}, sortedMiddleware: [], functions: {} }
  );
  const appPathRoutesManifest = readJsonSafe(
    join(nextDir, "app-path-routes-manifest.json"),
    {}
  );
  const functionsConfigManifestRaw = readJsonSafe(
    join(nextDir, "server", "functions-config-manifest.json"),
    { version: 1, functions: {} }
  );
  // The app has no real middleware. Next 16 emits a phantom `/_middleware` node
  // stub, and OpenNext's build-time check (useNodeMiddleware) already ignores it,
  // but the RUNTIME `getMiddlewareMatch` would still try to load its (non-existent)
  // chunk and throw ChunkLoadError. Strip the phantom so the runtime treats the
  // app as having no middleware.
  if (functionsConfigManifestRaw.functions) {
    delete functionsConfigManifestRaw.functions["/_middleware"];
  }
  const functionsConfigManifest = functionsConfigManifestRaw;

  const newBlock = [
    'var NEXT_DIR = "";',
    'var OPEN_NEXT_DIR = "";',
    `var NextConfig = ${embed(requiredServerFiles.config ?? {})};`,
    `var BuildId = ${JSON.stringify(buildId)};`,
    `var RoutesManifest = ${embed(routesManifest)};`,
    `var ConfigHeaders = ${embed(rawRoutesManifest.headers ?? [])};`,
    `var PrerenderManifest = ${
      prerenderManifest === undefined ? "undefined" : embed(prerenderManifest)
    };`,
    `var PagesManifest = ${embed(pagesManifest)};`,
    `var MiddlewareManifest = ${embed(middlewareManifest)};`,
    `var AppPathRoutesManifest = ${embed(appPathRoutesManifest)};`,
    `var FunctionsConfigManifest = ${embed(functionsConfigManifest)};`,
  ].join("\n");

  const patched = content.slice(0, startIdx) + newBlock + content.slice(endIdx);

  if (patched === content) {
    console.warn("[patch-opennext-middleware] No change applied to config block.");
    return;
  }

  writeFileSync(handlerPath, patched, "utf8");
  console.log(
    "[patch-opennext-middleware] Patched middleware handler: guarded import.meta.url and inlined config (no runtime fs.readFileSync)."
  );
}

main();
