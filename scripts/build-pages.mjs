import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");

const rootExtensions = new Set([".html", ".css", ".js", ".jsx"]);
const rootFiles = [
  "DATA_ISOLATION.md"
];
const publicDirs = [
  "assets",
  "screenshots",
  "stories"
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const dir of publicDirs) {
  await cp(join(root, dir), join(dist, dir), { recursive: true });
}

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const name = entry.name;
  if (!rootExtensions.has(extname(name)) && !rootFiles.includes(name)) continue;
  await cp(join(root, name), join(dist, name));
}

await writeFile(join(dist, "runtime-config.js"), `(() => {
  "use strict";

  window.NovelElfRuntime = Object.freeze({
    publicDemo: true,
    readOnly: true,
    aiEnabled: false,
    apiEnabled: false,
    storageEnabled: false,
    modeLabel: "public demo"
  });
})();
`, "utf8");
await writeFile(join(dist, ".nojekyll"), "", "utf8");

console.log(`Built GitHub Pages demo in ${dist}`);
