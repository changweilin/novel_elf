import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const mainUiFiles = [
  "index.html",
  "Aevenmere Atelier.html",
  "Aevenmere Atelier - Mobile.html",
  "app.jsx",
  "mobile.jsx",
  "workspace-state.jsx",
  "i18n.js"
];

const landingStrings = [
  "部署入口已備妥。選擇完整桌面工作台，或開啟手機展示版，從同一份 Aevenmere 世界資料開始瀏覽。",
  "主要入口",
  "進入桌面工作台",
  "開啟手機展示版",
  "瀏覽版本",
  "桌面工作台",
  "地圖、時間線、典籍與章節編輯器集中在完整寬度畫布。",
  "進入",
  "手機展示版",
  "以手機尺寸呈現地圖、編年、Codex 與 Leaf 的口袋體驗。",
  "開啟",
  "靜態部署入口，不需要建置流程。既有桌面版與手機版檔案保持原樣。"
];

const mobileShowcaseStrings = [
  "Folio IV · 手機版 · A pocket atlas",
  "The Atelier in the palm",
  "The cartographer's bench, made small. Walk the years with a thumb, lift a leaf in the rain, summon a soul from the back of the boat.",
  "Tweaks · 手機版",
  "↺ Re-cast the world",
  "Reset Aevenmere to its seed? Local edits will be lost."
];

test("main UI source files do not contain common mojibake markers", async () => {
  const mojibakePattern = /�|Ã[\x80-\xBF]|嚗|撌|銝|蝥/;

  for (const fileName of mainUiFiles) {
    const text = await readProjectFile(fileName);
    assert.doesNotMatch(text, mojibakePattern, `${fileName} contains likely mojibake text`);
  }
});

test("landing and mobile entry text is represented in i18n.js", async () => {
  const i18n = await readProjectFile("i18n.js");
  const indexHtml = await readProjectFile("index.html");
  const mobileHtml = await readProjectFile("Aevenmere Atelier - Mobile.html");

  for (const text of landingStrings) {
    assertIncludes(indexHtml, text, `landing entry should still expose ${JSON.stringify(text)} as source text`);
    assertI18nSource(i18n, text);
  }

  for (const text of mobileShowcaseStrings) {
    assertIncludes(mobileHtml, text, `mobile entry should still expose ${JSON.stringify(text)} as source text`);
    assertI18nSource(i18n, text);
  }
});

async function readProjectFile(fileName) {
  return readFile(join(projectRoot, fileName), "utf8");
}

function assertIncludes(source, needle, message) {
  assert.ok(source.includes(needle), `${message}; missing ${JSON.stringify(needle)}`);
}

function assertI18nSource(i18n, source) {
  assertIncludes(
    i18n,
    JSON.stringify(source),
    `i18n.js must define a translation entry for ${JSON.stringify(source)}`
  );
}
