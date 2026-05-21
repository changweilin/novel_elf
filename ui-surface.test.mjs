import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

test("desktop UI smoke surface includes story switcher, folio switcher, map, and codex", async () => {
  const html = await readProjectFile("Aevenmere Atelier.html");
  const app = await readProjectFile("app.jsx");
  const workspace = await readProjectFile("workspace-state.jsx");
  const codex = await readProjectFile("codex.jsx");

  assertIncludes(html, 'data-current="desktop"', "desktop entry must identify itself to viewport-router.js");
  assertScriptOrder(html, [
    "i18n.js",
    "data.js",
    "core.js",
    "story-import.js",
    "story-store.js",
    "draw.js",
    "ai.js",
    "workspace-state.jsx",
    "map.jsx",
    "timeline.jsx",
    "inspector.jsx",
    "details.jsx",
    "codex.jsx",
    "library.jsx",
    "chapter.jsx",
    "app.jsx"
  ], "desktop entry script order must load shared state and UI globals before app boot");

  assertIncludes(workspace, "window.useAevenmereWorkspace = useAevenmereWorkspace;", "shared hook global must be exposed before desktop boot");
  assertIncludes(app, 'className="story-select"', "desktop UI must render the story selector");
  assertIncludes(app, 'className="folio-switch"', "desktop UI must render the folio switcher");
  assertIncludes(app, "folio-tab", "desktop UI must render folio switch buttons");
  assertIncludes(app, 'className="map-frame"', "desktop UI must render the map container");
  assertIncludes(app, "<WorldMap", "desktop UI must mount the map component");
  assertIncludes(app, "<Codex", "desktop UI must mount the Codex block");
  assertIncludes(codex, 'className="codex"', "Codex component must expose its root block");
});

test("mobile UI smoke surface includes bottom tabs, year pill, and detail sheet path", async () => {
  const html = await readProjectFile("Aevenmere Atelier - Mobile.html");
  const mobile = await readProjectFile("mobile.jsx");
  const workspace = await readProjectFile("workspace-state.jsx");

  assertIncludes(html, 'data-current="mobile"', "mobile entry must identify itself to viewport-router.js");
  assertIncludes(html, 'id="device-primary"', "mobile entry must provide the render target");
  assertScriptOrder(html, [
    "i18n.js",
    "data.js",
    "core.js",
    "story-import.js",
    "story-store.js",
    "draw.js",
    "ai.js",
    "workspace-state.jsx",
    "map.jsx",
    "codex.jsx",
    "ios-frame.jsx",
    "tweaks-panel.jsx",
    "mobile.jsx"
  ], "mobile entry script order must load shared state, map, and codex globals before mobile boot");

  assertIncludes(workspace, "window.useAevenmereWorkspace = useAevenmereWorkspace;", "shared hook global must be exposed before mobile boot");
  assertIncludes(mobile, 'className="mob-tabbar"', "mobile UI must render the bottom tab bar");
  assertIncludes(mobile, 'className="mob-tab-label"', "mobile UI must render bottom tab labels");
  assertIncludes(mobile, 'className="mob-year-pill"', "mobile UI must render the current year pill");
  assertIncludes(mobile, 'className="mob-view"', "mobile UI must render the main mobile view shell");
  assertIncludes(mobile, "function DetailSheet", "mobile UI must keep the detail sheet component available");
  assertIncludes(mobile, 'className="mob-sheet"', "mobile detail sheet must expose its root container");
  assertIncludes(mobile, "window.MobileApp = MobileApp;", "mobile app global must be exposed before inline boot");
});

test("UI boot order protects against common runtime failures", async () => {
  const desktopHtml = await readProjectFile("Aevenmere Atelier.html");
  const mobileHtml = await readProjectFile("Aevenmere Atelier - Mobile.html");
  const app = await readProjectFile("app.jsx");
  const mobile = await readProjectFile("mobile.jsx");
  const workspace = await readProjectFile("workspace-state.jsx");

  assert.ok(
    scriptIndex(desktopHtml, "workspace-state.jsx") < scriptIndex(desktopHtml, "app.jsx"),
    "desktop common hook load failure: workspace-state.jsx must come before app.jsx"
  );
  assert.ok(
    scriptIndex(mobileHtml, "workspace-state.jsx") < scriptIndex(mobileHtml, "mobile.jsx"),
    "mobile common hook load failure: workspace-state.jsx must come before mobile.jsx"
  );
  assert.ok(
    scriptIndex(mobileHtml, "codex.jsx") < scriptIndex(mobileHtml, "mobile.jsx"),
    "mobile UI load failure: codex.jsx must come before mobile.jsx"
  );
  assertIncludes(app, "window.useAevenmereWorkspace(", "desktop render error guard: app.jsx must use the shared hook global");
  assertIncludes(mobile, "window.useAevenmereWorkspace(", "mobile render error guard: mobile.jsx must use the shared hook global");
  assertIncludes(workspace, "function useAevenmereWorkspace", "hook undefined guard: workspace-state.jsx must define the shared hook");
});

test("shared workspace hook exposes grouped API boundaries", async () => {
  const workspace = await readProjectFile("workspace-state.jsx");
  const app = await readProjectFile("app.jsx");
  const mobile = await readProjectFile("mobile.jsx");
  const groupedApiLine = "const { state, storyActions, entityActions, aiActions, sourceState } = workspace;";

  for (const group of ["state", "storyActions", "entityActions", "aiActions", "sourceState"]) {
    assertIncludes(workspace, `${group}: {`, `workspace hook must expose grouped ${group}`);
  }

  assertIncludes(app, groupedApiLine, "desktop app must consume the grouped workspace API");
  assertIncludes(mobile, groupedApiLine, "mobile app must consume the grouped workspace API");
  assertIncludes(workspace, "window.useAevenmereWorkspace = useAevenmereWorkspace;", "shared hook remains the only public workspace global");
});

async function readProjectFile(fileName) {
  return readFile(join(projectRoot, fileName), "utf8");
}

function assertIncludes(source, needle, message) {
  assert.ok(source.includes(needle), `${message}; missing ${JSON.stringify(needle)}`);
}

function scriptIndex(html, scriptName) {
  const pattern = new RegExp(`<script[^>]+src=["'][^"']*${escapeRegExp(scriptName)}(?:[?"'][^"']*)?["']`, "i");
  const match = pattern.exec(html);
  const index = match?.index ?? -1;
  assert.notEqual(index, -1, `entry HTML is missing script ${scriptName}`);
  return index;
}

function assertScriptOrder(html, scripts, message) {
  let previous = -1;
  for (const script of scripts) {
    const current = scriptIndex(html, script);
    assert.ok(current > previous, `${message}; ${script} is out of order`);
    previous = current;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
