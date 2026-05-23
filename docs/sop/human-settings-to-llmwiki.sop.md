# SOP: 讀取人類故事設定集並轉為 LLMwiki

## 目的

把作者以自然語言整理的故事設定集、世界觀筆記、角色表、大綱與章節草稿，轉成 Novel Elf 可讀寫的 LLMwiki 結構化 Markdown。

此處的 LLMwiki 指本專案的故事資料根目錄，也就是包含 `story.md`、`narrative.md`、`characters/`、`events/`、`library/` 等檔案的資料夾。

## 輸入與輸出位置

- 人類原始設定集預設放在 `.local/source-settings/<story-id>/`。
- 如果設定集很私密，也可以放在專案外，例如 `C:\Users\user\Documents\novel_elf_source_settings\<story-id>\`。
- 私人 LLMwiki 輸出放在 `.local/stories/<story-id>/`。
- 公開展示用 LLMwiki 才放在 `stories/<story-id>/`。

不要把人類原始設定集放進 `.local/stories/<story-id>/` 或 `stories/<story-id>/`。故事根目錄由 Novel Elf 的 Markdown 儲存器管理，非架構內的 `.md` 檔可能在儲存時被移到 `_archived/`。

## LLMwiki 目標結構

```text
.local/stories/<story-id>/
├─ story.md
├─ atlas.md
├─ relationships.md
├─ narrative.md
├─ eras/
├─ places/
├─ events/
├─ characters/
├─ organizations/
├─ countries/
└─ library/
   └─ <book-id>/
      ├─ book.md
      └─ <volume-id>/
         ├─ volume.md
         └─ <chapter-id>.md
```

## 轉換流程

1. 建立工作根目錄

   使用小寫英數、連字號或底線命名 `story-id`，例如 `moon-tide`。把人類原始檔放到 `.local/source-settings/moon-tide/`，LLMwiki 輸出放到 `.local/stories/moon-tide/`。

   在人類原始設定集資料夾中保留一份轉換紀錄，例如 `.local/source-settings/<story-id>/conversion-notes.md`。這份紀錄用來寫來源檔清單、已轉入的 LLMwiki 檔案、仍待確認的矛盾與尚未轉入的素材。

   轉換紀錄也要寫明後續寫作建議使用的 skill/sub-agent、關鍵背景來源、仍需 sub-agent 檢查的矛盾。這不是寫正文時的替代流程；寫正文仍必須依 `write-story-from-llmwiki.sop.md` 啟用 sub-agent 與 skill。

2. 盤點人類設定集

   讀完全部來源檔後，先列出來源清單、主故事名稱、預設年份、敘事語氣、明確事實、未定事項與互相矛盾處。不要在這一步替作者補設定；只標記「已知」、「推測」和「待確認」。

3. 抽取世界資料

   將來源拆成這些類別：

   - `story.md`：故事名稱、副標題、預設年份。
   - `narrative.md`：前提、主題、故事線、角色弧、懸念、敘事風格。
   - `eras/`：年代或時期，包含起訖年份與摘要。
   - `places/`：地點與地圖座標；未知座標可先給大致位置。
   - `countries/`：國家、政權、領土、首都、領袖與成立/滅亡年份。
   - `organizations/`：組織、勢力、總部、領袖、成員數與勢力範圍。
   - `characters/`：角色、定位、生卒年、所在地、狀態與角色筆記。
   - `events/`：年份、地點、參與者與事件摘要。
   - `relationships.md`：角色/國家/組織之間的關係。
   - `library/`：書、卷、章節、大綱與正文。

4. 正規化 ID 與引用

   使用穩定 ID，並在所有引用欄位使用 ID 而不是顯示名稱。

   - 角色：`ch_<slug>`
   - 地點：`pl_<slug>`
   - 事件：`ev_<slug>`
   - 組織：`or_<slug>`
   - 國家：`co_<slug>`
   - 年代：`era_<slug>` 或語意化短 ID
   - 故事線：`line_<slug>`
   - 懸念：`loop_<slug>`

5. 寫入 Markdown frontmatter

   每個架構檔以 JSON frontmatter 開頭，至少包含：

   ```markdown
   ---
   {
     "schema": "novel-elf.story-md.v1",
     "kind": "character",
     "id": "ch_example",
     "name": "Example Character"
   }
   ---
   # Example Character
   ```

   `kind` 必須符合所在類型，例如 `story`、`atlas`、`narrative`、`era`、`place`、`event`、`character`、`organization`、`country`、`relationships`、`book`、`volume`、`chapter`。

6. 建立敘事藍圖

   在 `narrative.md` 中補齊 LLM 寫作最需要的資訊：

   - `premise`：故事核心前提。
   - `themes`：主題詞。
   - `storylines`：每條故事線的目標、壓力、承諾與 POV 角色。
   - `characterArcs`：角色的 want、need、lie、目前弧線階段、下一個必要節拍。
   - `openLoops`：尚未償付的疑問、重要度與狀態。
   - `style`：敘事人稱、時態、句奏、感官優先序、譬喻規則、避免事項與對話規則。

7. 建立或整理書庫

   將人類大綱或正文放入 `library/<book-id>/<volume-id>/<chapter-id>.md`。章節 frontmatter 應盡量包含：

   - `title`
   - `year`
   - `placeId`
   - `povId`
   - `focusIds`
   - `eventIds`
   - `storylineIds`
   - `narrativeFunction`
   - `promiseRaised`
   - `promisePaid`
   - `status`
   - `words`

8. 檢查一致性

   完成後啟動私人工作用伺服器：

   ```powershell
   npm run dev
   ```

   在 UI 中檢查故事是否出現在書架、地圖、時間軸、資料列表與書庫中。再執行：

   ```powershell
   npm run test
   git status --short --untracked-files=all
   ```

   私人來源與私人 LLMwiki 應停留在 `.local/`，不應被 Git 追蹤。

## 品質檢查清單

- 人類來源檔已完整保留在 `.local/source-settings/<story-id>/` 或外部資料夾。
- 轉換紀錄已保存在 `.local/source-settings/<story-id>/conversion-notes.md` 或等效位置。
- 轉換紀錄已列出後續寫作建議使用的 skill/sub-agent、關鍵背景來源與待檢查矛盾。
- LLMwiki 沒有混入原始設定集備份檔。
- 每個 frontmatter 都是合法 JSON。
- `id` 穩定且沒有重複。
- 章節引用的 `placeId`、`povId`、`focusIds`、`eventIds` 都存在。
- 事件年份落在合理年代中。
- 角色、國家、組織的出現年份不違反生卒或成立/解散年份。
- 不確定設定已記在轉換筆記或 `narrative.md` 的待確認段落，而不是直接偽裝成既定事實。
