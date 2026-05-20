import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vm from "node:vm";
import test from "node:test";

function loadStoryImport() {
  return readFile(join(process.cwd(), "story-import.js"), "utf8").then((code) => {
    const sandbox = { window: {} };
    vm.runInNewContext(code, sandbox, { filename: "story-import.js" });
    return sandbox.window.StoryImport;
  });
}

test("blank import template does not create placeholder entities", async () => {
  const StoryImport = await loadStoryImport();
  const parsed = StoryImport.parseStoryMarkdown(StoryImport.templateMarkdown(), {
    fileName: "月影王國.md",
    title: "月影王國"
  });

  assert.equal(parsed.world.name, "月影王國");
  assert.equal(parsed.world.characters.length, 0);
  assert.equal(parsed.world.organizations.length, 0);
  assert.equal(parsed.world.countries.length, 0);
  assert.equal(parsed.world.events.length, 0);
  assert.equal(parsed.world.library.books.length, 0);
});

test("filled import markdown maps setting sections into a Novel Elf world", async () => {
  const StoryImport = await loadStoryImport();
  const parsed = StoryImport.parseStoryMarkdown(`
# Imported notes

## 故事
- 副標題: 暗潮邊境
- 預設年份: 1205

## 世界觀
潮汐會帶來記憶，王國靠記錄失物維持秩序。

## 故事大綱
- 第一幕: 記錄員發現潮汐改寫了王室血統。

## 地點
### 白潮港
- 座標: 420,260
- 描述: 記錄船出入的港城。

## 國家
### 月影王國
- 成立: 900
- 首都: 白潮港
- 領袖: 伊蓮女王
- 描述: 以潮汐曆法統治的島國。

## 組織
### 潮汐檔案館
- 成立: 960
- 總部: 白潮港
- 領袖: 首席記錄員
- 成員: 300
- 描述: 保存每一次潮汐留下的名字。

## 角色
### 黎安
- 定位: 年輕記錄員
- 出生: 1182
- 所在地: 白潮港
- 狀態: 調查中
- 描述: 她能讀懂被潮水刪去的文字。

## 事件
### 王室血統被改寫
- 年份: 1205
- 地點: 白潮港
- 參與者: 黎安, 潮汐檔案館, 月影王國
- 描述: 黎安發現王室族譜在一夜之間多出陌生名字。
`, {
    fileName: "moon-tide.md",
    title: "月潮紀事"
  });

  assert.equal(parsed.world.name, "月潮紀事");
  assert.equal(parsed.world.subtitle, "暗潮邊境");
  assert.equal(parsed.world.defaultYear, 1205);
  assert.equal(parsed.world.places[0].name, "白潮港");
  assert.equal(parsed.world.countries[0].name, "月影王國");
  assert.equal(parsed.world.organizations[0].snapshots[0].hq.name, "白潮港");
  assert.equal(parsed.world.characters[0].snapshots[0].location.name, "白潮港");
  assert.equal(parsed.world.events[0].participants.length, 3);
  assert.equal(parsed.world.library.books[0].volumes[0].chapters.length, 2);
});
