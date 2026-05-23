# SOP: 根據 LLMwiki 寫故事

## 目的

根據 Novel Elf 的 LLMwiki 結構化 Markdown 撰寫、續寫或改寫章節，並把正式正文存回書庫章節檔，同時保留草稿、版本與世界觀同步檢查。

## 輸入與輸出位置

- 讀取來源：`.local/stories/<story-id>/` 或指定的 `--stories-root` 之下的 `<story-id>/`。
- 正式章節：`<story-root>/<story-id>/library/<book-id>/<volume-id>/<chapter-id>.md`。
- 草稿與版本：`<story-root>/<story-id>/_drafts/articles/`。
- 公開展示故事才使用 `stories/<story-id>/`；私人創作預設使用 `.local/stories/<story-id>/`。

## 寫作任務必填單

每次開始寫作前，先在工作紀錄或回覆中明確列出這些資訊。沒有填完前不要直接產生正式正文。

```text
storyRoot:
storyId:
action: new | continue | rewrite
subAgentRequired: true
subAgentName:
subAgentRole: continuity | prose | canon-check | style-check
skillRequired: true
skillName:
skillPathOrVersion:
skillPurpose:
agentSkillRunRecord:
targetArticleId: chapter:<book-id>/<volume-id>/<chapter-id>
officialPath: <story-root>/<story-id>/library/<book-id>/<volume-id>/<chapter-id>.md
draftPath: <story-root>/<story-id>/_drafts/articles/<safe-article-id>/<draft-id>.md
continueFromArticleId:
continueFromPath:
continueAnchor: end-of-article | selected-section | named-scene | outline-beat
targetWords:
backgroundSources:
```

`targetArticleId` 是要寫入或改寫的章節。`continueFromArticleId` 是要接續的文章；通常與 `targetArticleId` 相同，代表從該章既有正文末尾續寫。若要從前一章接續，則填同卷前一個 chapter article id。`backgroundSources` 必須列出這次採用的 LLMwiki 檔案，例如 `narrative.md`、目標章節、相關角色、事件、地點與相鄰章節。

`subAgentRequired` 與 `skillRequired` 在寫故事、續寫、改寫正文時預設為 `true`。`subAgentName`、`skillName` 與 `agentSkillRunRecord` 未填完前，不得產生或套用正式章節正文。若環境沒有可用 sub-agent 或可用 skill，必須把任務標示為 `blocked` 並明確告知缺口；不可把一般 LLM 回答冒充為已使用 sub-agent 或 skill。

## Sub-agent 與 Skill 使用要求

每次執行 `new`、`continue` 或 `rewrite` 前，都必須先做 skill gate 與 sub-agent gate。

Skill gate：

- 若目前環境有小說寫作、LLMwiki 寫作或本專案專用 Codex skill，必須先使用該 skill，並在 `skillName`、`skillPathOrVersion` 與 `agentSkillRunRecord` 記錄名稱、路徑/版本、用途與產出。
- 若使用者指定特定 skill，必須使用該 skill；若該 skill 不存在，先明確告知並停止確認，不要假裝已使用。
- 若沒有專用 Codex skill，將本檔 `docs/sop/write-story-from-llmwiki.sop.md` 當作 project writing skill 使用，並在 `skillName` 記錄 `project-sop`、在 `skillPathOrVersion` 記錄 `docs/sop/write-story-from-llmwiki.sop.md`、在 `agentSkillRunRecord` 記錄 `dedicated Codex story skill unavailable; project SOP used as writing skill`。
- Skill 必須用於可驗證的步驟，例如產出或驗證 `backgroundSources`、整理上下文包、生成章節大綱、檢查 LLMwiki 引用或審核正文風格。
- 若寫作任務包含插圖、文件輸出、簡報或瀏覽器驗證，另依任務使用對應 skill，例如 `imagegen`、`documents`、`presentations` 或 `browser`。

Sub-agent gate：

- 每次正式寫作前至少使用一個 continuity sub-agent，請它根據 `targetArticleId`、`continueFromArticleId` 與 `backgroundSources` 檢查世界觀、時間線、角色狀態、引用 ID、相鄰章節銜接與可能矛盾。
- 長章、重寫、主線章或高風險章節，另使用 style/scene sub-agent 檢查草稿是否符合 `narrative.md`、目標章節的 `narrativeFunction`、POV、張力與承諾償付。
- Sub-agent 預設只輸出審查、風險與建議；不要讓 sub-agent 直接覆寫正式 `library/` 章節檔。若需要 sub-agent 寫草稿，必須指定互不衝突的草稿路徑。
- Sub-agent 的輸出摘要必須寫入 `agentSkillRunRecord` 或最終回覆，並列出已處理、待確認與阻斷問題。
- 在 continuity sub-agent 完成前，不要把正文套用到正式章節。若 sub-agent 工具不可用或使用者明確要求不要使用，必須標示 `blocked`；沒有使用 sub-agent 的故事寫作任務不得宣稱符合本 SOP。

## 寫作前讀取順序

1. `story.md`：確認故事名稱、副標題、預設年份。
2. `narrative.md`：確認前提、主題、故事線、角色弧、懸念與文風規則。
3. 目標章節 frontmatter：確認年份、地點、POV、焦點角色、關聯事件、敘事功能與要拋出/償付的懸念。
4. `characters/`、`places/`、`events/`：只讀取目標章節直接引用的資料，再視需要讀取相鄰資料。
5. `relationships.md`、`organizations/`、`countries/`、`eras/`：檢查勢力、年代與人物關係是否影響本章。
6. 相鄰章節：讀取同卷前一章與後一章，避免語氣、連續性與節奏斷裂。

## 背景資訊來源優先序

寫作時以 LLMwiki 為正式事實來源，來源優先序如下：

1. 目標章節 frontmatter 與既有正文。
2. `narrative.md` 的前提、故事線、角色弧、懸念與文風規則。
3. 目標章節直接引用的 `characters/`、`places/`、`events/`。
4. `relationships.md`、相關 `organizations/`、`countries/`、`eras/`。
5. 同卷前後章節與同書大綱。
6. `.local/source-settings/<story-id>/` 或外部人類設定集，只作為追溯與釐清來源；如果從這裡採用尚未進入 LLMwiki 的新事實，必須同步寫回 LLMwiki。

若來源互相衝突，以 LLMwiki 內的結構化資料優先；人類原始設定集中的差異要標成待同步或待確認，不要直接在正文中偷偷改定。

## 章節 frontmatter 建議欄位

```json
{
  "schema": "novel-elf.story-md.v1",
  "kind": "chapter",
  "id": "ch_example_01",
  "title": "Chapter Title",
  "year": 1209,
  "placeId": "pl_example",
  "povId": "ch_pov",
  "focusIds": ["ch_pov", "ch_other"],
  "eventIds": ["ev_inciting_event"],
  "storylineIds": ["line_main"],
  "sceneType": "setup",
  "narrativeFunction": "State what this chapter must accomplish.",
  "tensionLevel": 6,
  "promiseRaised": ["loop_question"],
  "promisePaid": [],
  "status": "draft",
  "words": 0,
  "illustrations": []
}
```

## 寫作流程

1. 鎖定目標章節

   先確認要寫的是新章、續寫既有章，還是改寫既有段落。若是新章，先在正確的 `library/<book-id>/<volume-id>/` 下建立章節檔與 frontmatter。

   若使用者沒有指定要接續哪篇文章，先依序判定：

   - 目前 UI 或任務描述中選中的 chapter article。
   - 同書同卷中 `status` 為 `draft` 或 `outline`、且排序最後的章節。
   - 同書同卷最後一篇正式章節。

   若仍無法唯一判定，就先詢問使用者，不要自行選一篇開始寫。

2. 建立上下文包

   整理本章必讀資料：

   - 章節目標與敘事功能。
   - POV 角色當前狀態、want、need、lie。
   - 本章地點的感官特徵與限制。
   - 本章事件的前因後果。
   - 本章會推進的故事線與懸念。
   - 相鄰章節最後/開頭的情緒與資訊狀態。

   若開發伺服器已啟動，可使用文章 API 產生上下文包：

   ```text
   GET /api/stories/<story-id>/articles/chapter:<book-id>/<volume-id>/<chapter-id>/context?task=continue_article
   ```

   上下文包建立後，必須交給 continuity sub-agent 檢查是否缺少角色、地點、事件、前後章引用或世界觀來源。Skill 必須產出或驗證 `backgroundSources` 清單。若 sub-agent 回報缺漏，先補讀 LLMwiki 並更新必填單，再開始寫正文。

3. 先寫草稿

   原則上先產出草稿，不直接覆寫正式章節。透過 UI 或 API 寫入草稿時，草稿會落在：

   ```text
   <story-root>/<story-id>/_drafts/articles/<safe-article-id>/<draft-id>.md
   ```

   草稿應保持正式章節同樣的 frontmatter 形狀，只調整需要更新的欄位與正文。

   正式正文只保存到 `officialPath` 指向的 `library/` 章節檔。不要把正文保存在 `.local/source-settings/`，也不要把草稿散放在故事根目錄。

4. 寫正文

   正文要優先遵守 LLMwiki 既有事實。可以新增細節，但不能違反以下限制：

   - 不讓角色知道他在此時點不可能知道的資訊。
   - 不讓角色、國家或組織出現在生卒、成立或解散時間之外。
   - 不改變已存在事件的年份、地點與參與者，除非同步更新 LLMwiki。
   - 不新增重大世界規則而不記錄到 `narrative.md` 或相關實體檔。

   正文草稿可由主執行者生成，但進入正式保存前必須經 sub-agent 或 skill 做至少一次 canon/style review。Review 必須檢查 POV、時間線、角色知識邊界、已知事件、文風規則與承諾償付。若 review 回報阻斷問題，不得套用正式章節。

5. 回填章節 metadata

   草稿完成後更新：

   - `words`
   - `status`
   - `promiseRaised`
   - `promisePaid`
   - `eventIds`
   - `focusIds`
   - `sourceRefs`，如果正文引用了特定設定來源

6. 品質檢查

   在 UI 或文章 API 檢查章節品質：

   ```text
   GET /api/stories/<story-id>/articles/chapter:<book-id>/<volume-id>/<chapter-id>/quality
   ```

   若檢查草稿：

   ```text
   GET /api/stories/<story-id>/articles/chapter:<book-id>/<volume-id>/<chapter-id>/drafts/<draft-id>/quality
   ```

   必修檢查：

   - 已記錄使用的 sub-agent 名稱與職責。
   - 已記錄使用的 skill 名稱與版本/路徑。
   - sub-agent 已完成連續性或世界觀檢查。
   - skill 已完成上下文、文風或 LLMwiki 引用檢查。
   - frontmatter 可解析。
   - `kind` 與文章類型相符。
   - 所有引用 ID 都存在。
   - 事件年份與章節年份合理。
   - 地點與事件地點沒有互相衝突。
   - 文風符合 `narrative.md`。
   - 若任何 sub-agent 或 skill 檢查不可執行，完成紀錄必須標示 `blocked`，不能標示為完成。

7. 套用正式章節

   草稿通過後再套用到正式章節。套用前會保留版本到：

   ```text
   <story-root>/<story-id>/_drafts/articles/<safe-article-id>/versions/
   ```

8. 同步世界觀

   如果正文產生新的既定事實，要回到 LLMwiki 相關檔案補齊：

   - 新角色或角色狀態變化：`characters/`
   - 新事件：`events/`
   - 新地點：`places/`
   - 新組織/國家變化：`organizations/` 或 `countries/`
   - 新關係：`relationships.md`
   - 新主題、故事線、懸念或文風規則：`narrative.md`

## 完成定義

- 正式章節位於 `library/` 的正確書/卷底下。
- 草稿與版本若有產生，保留在 `_drafts/articles/`。
- 寫作任務必填單已記錄使用的 skill、sub-agent、目標文章、接續文章、正式保存路徑、草稿路徑與背景資料來源。
- continuity sub-agent 已完成審查，且檢查結果已處理或標記為待確認。
- skill 的產出已納入上下文包、正文、metadata 或品質檢查。
- 沒有使用 sub-agent 或 skill 的故事寫作任務不得宣稱符合本 SOP。
- 章節 frontmatter 與正文一致。
- 章節引用的世界資料都存在且不矛盾。
- 新增世界事實已同步回 LLMwiki。
- 私人故事仍留在 `.local/stories/`，沒有誤提交到 Git。
