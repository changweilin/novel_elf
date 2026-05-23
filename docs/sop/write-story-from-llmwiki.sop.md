# SOP: 根據 LLMwiki 寫故事

## 1. 目的與基本路徑

本 SOP 用於根據 Novel Elf 的 LLMwiki 結構化 Markdown 撰寫、續寫或改寫章節。核心原則是：以 LLMwiki 作為正式事實來源，先產生草稿與審查紀錄，通過後才套用到正式章節，並同步更新世界觀、事件、角色與長期記憶。

- 讀取來源：`.local/stories/<story-id>/`，或指定 `--stories-root` 下的 `<story-id>/`。
- 正式章節：`<story-root>/<story-id>/library/<book-id>/<volume-id>/<chapter-id>.md`。
- 草稿與版本：`<story-root>/<story-id>/_drafts/articles/`。
- 公開展示故事才使用 `stories/<story-id>/`；私人創作預設留在 `.local/stories/<story-id>/`，不要誤提交到 Git。

## 2. 寫作任務必填單

每次執行 `new`、`continue` 或 `rewrite` 前，先在工作紀錄或回覆中填完下列資訊。未填完前，不要直接產生或套用正式正文。

```text
storyRoot:
storyId:
action: new | continue | rewrite

targetArticleId: chapter:<book-id>/<volume-id>/<chapter-id>
officialPath: <story-root>/<story-id>/library/<book-id>/<volume-id>/<chapter-id>.md
draftPath: <story-root>/<story-id>/_drafts/articles/<safe-article-id>/<draft-id>.md

continueFromArticleId:
continueFromPath:
continueAnchor: end-of-article | selected-section | named-scene | outline-beat
targetWords: 3000 if unset

activeEventId:
eventArcTargetWords: 50000-60000 as pacing reference if unset
eventArcProgressWords:
eventClosureCriteria:

recentChapterWindow:
longMemorySources:
backgroundSources:

skillRequired: true
skillName:
skillPathOrVersion:
skillPurpose:

subAgentRequired: true
subAgentName:
subAgentRole: continuity | prose | canon-check | style-check
agentSkillRunRecord:
```

欄位說明：

- `targetArticleId` 是要寫入或改寫的章節。
- `continueFromArticleId` 是接續來源；通常等於 `targetArticleId`，代表從同章既有正文末尾續寫。若從前一章接續，填同卷前一個 chapter article id。
- `targetWords` 是本章目標字數；未設定時預設約 3000 字，但不是硬性限制。實際字數可多可少，以場景完整、節奏自然與章節功能完成為優先；短續寫、片段改寫或長章可由使用者明確覆蓋。
- `activeEventId` 是本章推進或收束的主要事件。
- `eventArcTargetWords` 未設定時以 50,000 到 60,000 字作為 pacing 參考，不是硬性規定；實際長短以事件是否完整推進、自然收束或需要延展為準。`eventArcProgressWords` 記錄事件 arc 累積字數；`eventClosureCriteria` 記錄事件怎樣才算完成。
- `recentChapterWindow` 記錄本次實際讀取的近章範圍。
- `longMemorySources` 記錄更早內容使用的摘要、索引或設定資料。
- `backgroundSources` 必須列出本次採用的 LLMwiki 檔案，例如 `narrative.md`、目標章節、相關角色、事件、地點與相鄰章節。

## 3. Skill 與 Sub-agent gate

寫故事、續寫與改寫正文時，`skillRequired` 與 `subAgentRequired` 預設為 `true`。`skillName`、`subAgentName` 與 `agentSkillRunRecord` 未記錄完成前，不得宣稱符合本 SOP。

### Skill gate

- 若環境有小說寫作、LLMwiki 寫作或本專案專用 Codex skill，必須先使用，並記錄名稱、路徑/版本、用途與產出。
- 若使用者指定特定 skill，必須使用；若不存在，先明確告知並停止確認，不要假裝已使用。
- 若沒有專用 Codex skill，將本檔作為 project writing skill，並記錄：
  - `skillName: project-sop`
  - `skillPathOrVersion: docs/sop/write-story-from-llmwiki.sop.md`
  - `agentSkillRunRecord: dedicated Codex story skill unavailable; project SOP used as writing skill`
- Skill 必須對可驗證步驟產生作用，例如整理或驗證 `backgroundSources`、建立上下文包、生成章節大綱、檢查 LLMwiki 引用或審核正文風格。
- 若任務包含插圖、文件、簡報或瀏覽器驗證，另依任務使用 `imagegen`、`documents`、`presentations` 或 `browser` 等對應 skill。

### Sub-agent gate

- 正式寫作前至少使用一個 continuity sub-agent，根據 `targetArticleId`、`continueFromArticleId` 與 `backgroundSources` 檢查世界觀、時間線、角色狀態、引用 ID、相鄰章節銜接與可能矛盾。
- 長章、重寫、主線章或高風險章節，另使用 style/scene sub-agent 檢查是否符合 `narrative.md`、目標章節 `narrativeFunction`、POV、張力與承諾償付。
- Sub-agent 預設只輸出審查、風險與建議；不要讓它直接覆寫正式 `library/` 章節檔。若需要 sub-agent 寫草稿，必須指定互不衝突的草稿路徑。
- Sub-agent 輸出摘要必須寫入 `agentSkillRunRecord` 或最終回覆，並列出已處理、待確認與阻斷問題。
- Continuity sub-agent 完成前，不得把正文套用到正式章節。若 sub-agent 不可用，或使用者明確要求不要使用，完成紀錄必須標示 `blocked`；不得宣稱完全符合本 SOP。

## 4. 背景資料、近章窗口與長期記憶

寫作以 LLMwiki 的結構化資料為正式事實來源。若來源衝突，以 LLMwiki 優先；人類原始設定或外部資料中的差異，標成待同步或待確認，不要偷偷寫進正文。

背景來源優先序：

1. 目標章節 frontmatter 與既有正文。
2. 接續來源章與章節記憶窗口內的前後章。
3. `narrative.md`：前提、故事線、角色弧、懸念、文風規則。
4. 目標章節直接引用的 `characters/`、`places/`、`events/`。
5. `relationships.md`、相關 `organizations/`、`countries/`、`eras/`。
6. 同書/同卷大綱、章節摘要與 long memory 欄位。
7. `.local/source-settings/<story-id>/` 或外部人類設定集，只作追溯與釐清；若採用尚未進入 LLMwiki 的新事實，必須同步寫回 LLMwiki。

預設章節記憶窗口：

- 目標章：讀取全文、frontmatter、outline、chunks。
- 接續來源章：讀取全文；若與目標章相同，至少讀取同章全文與最後 6 到 12 段。
- 前 2 章：讀取全文，或至少讀取完整摘要、最後 3 到 6 段、角色狀態變化與未解承諾。
- 後 1 章：若已存在，讀取摘要與開頭/大綱，避免寫出撞到後文的轉折。
- 前 3 到 5 章：讀取 `summary`、`continuityNotes`、`promiseRaised`、`promisePaid`、`eventIds`、`focusIds`。
- 更早章節：不預設讀全文，改用 long memory 掌握。

若任務涉及主線重寫、大型伏筆償付、角色死亡/背叛、時間跳躍、卷首或卷末，把窗口提高到前 5 章摘要，並至少抽讀所有直接相關的舊章全文片段。

文章 API 的 context pack 可提供目標文章、正文、世界資料、附近時間線與相鄰章節摘要，但不是完整長篇記憶。若需要前 2 章全文或更早伏筆，必須額外讀取對應 `library/` 章節檔並列入 `backgroundSources`。

長期記憶維護：

- 每次套用正式章節前，至少更新該章 `summary` 與 `continuityNotes`。
- 若章節改變角色狀態、事件、關係或伏筆，必須同步更新對應 LLMwiki 檔案。
- 沒有摘要的舊章若被用作背景來源，先補一段 1 到 3 句摘要再繼續寫。
- `_drafts/articles/` 只作草稿與版本追溯，不作正式世界記憶來源。

## 5. 事件篇章尺度

本專案的「事件」不是單一場景，而是可跨多章推進的事件 arc。50,000 到 60,000 字只是預設 pacing 參考，不是硬性規定；中文作品以字數估算，英文草稿使用 word count，並在工作紀錄標明計算方式。

事件 arc 預設階段：

- `setup`：事件被引爆，主要人物被捲入。
- `escalation`：阻力升高，角色作出代價明確的選擇。
- `reversal`：資訊、立場或關係出現不可逆轉折。
- `climax`：事件核心衝突被正面處理。
- `closure`：事件結果、代價、角色狀態與下一個鉤子都被寫清楚。

寫作時，每章的 `eventIds` 可以引用同一個 `activeEventId`，直到該事件 arc 完成。事件完成不看硬性字數，而是看 `eventClosureCriteria` 是否滿足。若一個事件明顯拖慢、過短或範圍失焦，下一次寫作任務前要做 pacing review：拆成兩個事件、壓縮支線，或明確延長為卷級事件。若事件比預設參考短很多就完成，也只需記錄原因，例如短篇事件、橋接事件或支線事件。

事件收束時同步更新：

- `events/<event-id>.md`：事件結果、代價、參與者、地點與後續影響。
- 相關章節：`summary`、`continuityNotes`、`promisePaid`、`eventIds`。
- `characters/`：角色狀態、所在地、關係、知識邊界與心理變化。
- `relationships.md`：因事件改變的關係。
- `narrative.md`：關閉或轉移 open loops，更新故事線壓力。
- `book.md` 或 `volume.md`：事件 arc 進度摘要與下一事件鉤子。

## 6. 章節 frontmatter 建議欄位

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
  "activeEventId": "ev_inciting_event",
  "eventArcTargetWords": 60000,
  "eventArcProgressWords": 12000,
  "sceneType": "setup",
  "narrativeFunction": "State what this chapter must accomplish.",
  "tensionLevel": 6,
  "summary": "One to three sentences for future long memory.",
  "continuityNotes": "Facts that future chapters must remember.",
  "promiseRaised": ["loop_question"],
  "promisePaid": [],
  "sourceRefs": ["ch_pov", "ev_inciting_event"],
  "status": "draft",
  "words": 0,
  "illustrations": []
}
```

## 7. 寫作流程

### 1. 鎖定目標章節

先確認任務是新章、續寫既有章，還是改寫既有段落。新章需在正確的 `library/<book-id>/<volume-id>/` 建立章節檔與 frontmatter。

若使用者未指定接續文章，依序判定：目前 UI 或任務描述選中的 chapter article；同書同卷中 `status` 為 `draft` 或 `outline` 且排序最後的章節；同書同卷最後一篇正式章節。仍無法唯一判定時，先詢問使用者。

### 2. 建立上下文包

上下文包至少包含：章節目標與敘事功能、`activeEventId` 的 arc 狀態與 closure criteria、目標章/接續章/相鄰章、POV 角色的 want/need/lie、地點限制、事件前因後果、故事線與懸念、相鄰章情緒與資訊狀態，以及 long memory。

若開發伺服器已啟動，可使用：

```text
GET /api/stories/<story-id>/articles/chapter:<book-id>/<volume-id>/<chapter-id>/context?task=continue_article
```

上下文包建立後，交由 continuity sub-agent 檢查缺漏與矛盾；skill 必須產出或驗證 `backgroundSources`。若回報缺漏，先補讀 LLMwiki 並更新必填單，再開始正文。

### 3. 先寫草稿

原則上先寫草稿，不直接覆寫正式章節。草稿位置：

```text
<story-root>/<story-id>/_drafts/articles/<safe-article-id>/<draft-id>.md
```

草稿應保留正式章節的 frontmatter 形狀，只調整需要更新的欄位與正文。正式正文只保存到 `officialPath` 指向的 `library/` 章節檔；不要存到 `.local/source-settings/` 或故事根目錄。

### 4. 撰寫正文

正文優先遵守 LLMwiki 既有事實。可以新增細節，但不能違反以下限制：

- 不讓角色知道此時點不可能知道的資訊。
- 不讓角色、國家或組織出現在生卒、成立或解散時間之外。
- 不改變既有事件的年份、地點與參與者，除非同步更新 LLMwiki。
- 不新增重大世界規則而不記錄到 `narrative.md` 或相關實體檔。

正文草稿可由主執行者生成；套用正式章節前，必須經 sub-agent 或 skill 做至少一次 canon/style review，檢查 POV、時間線、角色知識邊界、已知事件、文風規則與承諾償付。若 review 回報阻斷問題，不得套用正式章節。

### 5. 回填 metadata

草稿完成後更新：`words`、`summary`、`continuityNotes`、`status`、`promiseRaised`、`promisePaid`、`eventIds`、`focusIds`、`activeEventId`、`eventArcProgressWords`、`sourceRefs`。

### 6. 品質檢查

正式章節品質檢查：

```text
GET /api/stories/<story-id>/articles/chapter:<book-id>/<volume-id>/<chapter-id>/quality
```

草稿品質檢查：

```text
GET /api/stories/<story-id>/articles/chapter:<book-id>/<volume-id>/<chapter-id>/drafts/<draft-id>/quality
```

必修檢查項：

- 已記錄 sub-agent 名稱、職責、檢查結果與 skill 名稱、版本/路徑、產出。
- `recentChapterWindow`、`longMemorySources`、`backgroundSources` 已列明。
- `activeEventId`、`eventArcProgressWords`、`eventClosureCriteria` 已更新。
- 目標章 `summary` 與 `continuityNotes` 已更新。
- frontmatter 可解析，`kind` 與文章類型相符，所有引用 ID 存在。
- 事件年份、章節年份、地點與事件地點不衝突。
- 若事件 arc 長度、節奏或範圍明顯偏離預期，已檢查是否該收束、拆分或延長。
- 文風符合 `narrative.md`。
- 若任何 sub-agent 或 skill 檢查不可執行，完成紀錄必須標示 `blocked`。

### 7. 套用正式章節

草稿通過後再套用到正式章節。套用前保留版本到：

```text
<story-root>/<story-id>/_drafts/articles/<safe-article-id>/versions/
```

### 8. 同步世界觀

若正文產生新的既定事實，回填對應 LLMwiki：

- 新角色或角色狀態變化：`characters/`
- 新事件：`events/`
- 新地點：`places/`
- 新組織/國家變化：`organizations/` 或 `countries/`
- 新關係：`relationships.md`
- 新主題、故事線、懸念或文風規則：`narrative.md`

## 8. 完成定義

完成一個寫作任務時，必須同時滿足：

- 正式章節位於 `library/` 的正確書/卷底下；草稿與版本若有產生，保留在 `_drafts/articles/`。
- 寫作任務必填單已記錄 skill、sub-agent、目標文章、接續文章、正式保存路徑、草稿路徑、背景資料來源、近章窗口、長期記憶來源與事件 arc 狀態。
- Continuity review 已完成，且檢查結果已處理或標記待確認；沒有使用 sub-agent 或 skill 的任務不得宣稱符合本 SOP。
- 章節 frontmatter 與正文一致，`summary` 與 `continuityNotes` 足以支援後續長篇記憶。
- 章節引用的世界資料存在且不矛盾；新增世界事實已同步回 LLMwiki。
- 若本章收束事件 arc，`events/`、角色狀態、關係、open loops 與書/卷摘要已同步更新。
- 私人故事仍留在 `.local/stories/`，沒有誤提交到 Git。
