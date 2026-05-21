# 桌機/手機切換後續改進計畫

## 摘要

本計畫接續目前已完成的桌機/手機路由改善與 `useAevenmereWorkspace` 共用狀態重構。下一階段重點不是重做 UI，而是把這次改動變得更可驗證、更容易維護，並降低未來桌機/手機功能分岔的成本。

## 執行進度

- 2026-05-21 20:01 Asia/Taipei：P1 已完成。新增 `viewport-router.test.mjs`，並在 `package.json` 加入 `npm run test:router`；完整 `npm run test` 通過 10 項測試。下一步依建議順序接續 P3。
- 2026-05-21 20:21 Asia/Taipei：P3 已完成。新增 `ui-surface.test.mjs`，並在 `package.json` 加入 `npm run test:ui`；測試覆蓋桌機入口的 story switcher、folio switcher、map、Codex，以及手機入口的 bottom tabs、year pill、detail sheet 路徑與 boot order。以瀏覽器實測桌機與手機入口，console error 為空；完整 `npm run test` 通過 13 項測試。下一步依建議順序接續 P2。
- 2026-05-21 20:41 Asia/Taipei：P2 已完成。`useAevenmereWorkspace` 現在回傳 `state`、`sourceState`、`storyActions`、`entityActions`、`aiActions` 五個群組，`app.jsx` 與 `mobile.jsx` 已改用分組 API；新增 grouped API 邊界測試。瀏覽器實測桌機與手機入口，console error 為空；完整 `npm run test` 通過 14 項測試。下一步依建議順序接續 P6 的文章索引 API、讀取 API 與 draft write。
- 2026-05-21 21:01 Asia/Taipei：P6 第一段已完成。新增 `story-articles.mjs`，並在 dev server 加入 `GET /api/stories/:id/articles`、`GET /api/stories/:id/articles/:articleId`、`POST /api/stories/:id/articles/:articleId/drafts`。索引會回傳 story/book/volume/chapter 文件摘要，讀取會回傳 frontmatter、markdown body、outline、chunks、相鄰章節與關聯世界摘要，draft write 會寫入 `_drafts/articles/` 並產生 diff preview，不覆蓋正式文章。完整 `npm run test` 通過 15 項測試。下一步接續 P6 的 patch-based update、AI 任務 schema 與 context packer。
- 2026-05-21 21:21 Asia/Taipei：P6 第二段已完成。`POST /api/stories/:id/articles/:articleId/drafts` 現在支援 `bodyPatch`（append/prepend/replace_text/replace_section/replace_body）與 frontmatter patch draft；新增 `GET /api/article-tasks` 提供 7 種 AI 任務 schema，並新增 `GET /api/stories/:id/articles/:articleId/context?task=...&maxChars=...` 產生受字數限制的 context pack。完整 `npm run test` 通過 15 項測試。下一步接續 P6 的正式套用確認/回復版本與文章品質驗證。
- 2026-05-21 22:22 Asia/Taipei：P6 第三段已完成。新增 confirmed apply 與 restore-version API：`POST /api/stories/:id/articles/:articleId/drafts/:draftId/apply` 需要 `confirmApply: true` 才會把 draft 套用到正式文章，套用前會在 `_drafts/articles/.../versions/` 保留可回復版本；`GET /api/stories/:id/articles/:articleId/versions` 可列出版本，`POST /api/stories/:id/articles/:articleId/versions/:versionId/restore` 需要 `confirmRestore: true` 才會回復，且回復前也會保留 rollback version。完整 `npm run test` 通過 15 項測試。下一步接續 P6 的文章品質驗證。
- 2026-05-21 22:28 Asia/Taipei：P6 第四段已完成。新增文章品質驗證 API：`GET /api/stories/:id/articles/:articleId/quality` 驗證正式文章，`GET /api/stories/:id/articles/:articleId/drafts/:draftId/quality` 驗證 draft；檢查包含 Markdown/frontmatter parse、world sync 缺漏引用、年份/角色生死/組織國家成立與解散等一致性。測試覆蓋良好文章、缺漏世界資料、角色死亡後出現、壞掉的 draft frontmatter；完整 `npm run test` 通過 15 項測試。P6 已完成，下一步依部署需求接續 P4 或 P5。
- 2026-05-21 22:52 Asia/Taipei：P4 已完成第一版。新增 `SCRIPT_LOAD_ORDER.md`，明確列出 landing/desktop/mobile entry、React/ReactDOM/Babel CDN、data/core/store/ai、`workspace-state.jsx`、桌機/手機 UI globals 與 boot script 的載入順序；現階段暫不導入 build step，仍以文件加 `ui-surface.test.mjs` 的 script order guard 管理風險。`npm run test:ui` 與完整 `npm run test` 均通過 15 項測試。下一步依建議順序接續 P5。
- 2026-05-21 23:12 Asia/Taipei：P5 已完成第一版。新增 `i18n-surface.test.mjs` 與 `npm run test:i18n`，檢查主入口 HTML/JS/JSX 不含常見 mojibake 標記，並確認 landing 與 mobile showcase 的主要顯示文字都有 `i18n.js` 翻譯來源；完整 `npm run test` 通過 17 項測試。P1-P6 皆已完成。

## P1：補上瀏覽器行為測試（已完成）

- 建立一組輕量 browser smoke test，驗證 `viewport-router.js` 的核心情境：
  - 寬版 `/index.html` 導向桌面版。
  - 窄版 `/index.html` 導向手機版。
  - `?view=desktop` 與 `?view=mobile` 永遠優先。
  - resize 後不發生自動換頁。
- 測試只讀取 URL、DOM 狀態與 console error，不建立故事、不寫入資料。
- 驗收標準：
  - 可用單一 npm script 執行。
  - CI 或本機執行時能明確指出是哪個 routing case 失敗。

## P2：整理 `workspace-state.jsx` 的 API 邊界（已完成）

- 將 hook 回傳值分組，降低 `app.jsx` / `mobile.jsx` 解構清單過長的問題：
  - `state`
  - `storyActions`
  - `entityActions`
  - `aiActions`
  - `sourceState`
- 保持目前 `window.useAevenmereWorkspace(options)` 作為唯一 public global。
- 不改 storage keys、API routes、世界資料 schema。
- 驗收標準：
  - 桌機與手機仍只透過同一個 hook 取得故事、AI、CRUD 行為。
  - `app.jsx` 與 `mobile.jsx` 的 top-level 狀態只保留各自 UI 專屬狀態。

## P3：加入最小互動驗證（已完成）

- 增加不破壞資料的 UI 檢查：
  - 桌機版確認故事切換器、Folio switcher、地圖容器、Codex 區塊存在。
  - 手機版確認 bottom tabs、year pill、mobile sheet 容器可正常渲染。
  - console 不出現 `Identifier already declared`、hook undefined、React render error。
- 對會改資料的按鈕只檢查 enabled/visible，不直接 click。
- 驗收標準：
  - 測試能覆蓋桌機與手機入口。
  - 測試失敗訊息能指出是桌機 UI、手機 UI 或共用 hook 載入問題。

## P4：降低 in-browser Babel / CDN 風險

- 評估是否引入簡單 build step，把目前多個 `text/babel` 檔案預編譯為 browser-ready JS。
- 若暫時不導入 build，至少建立一份載入順序文件，明確列出：
  - data/core/store/ai
  - shared workspace hook
  - UI components
  - desktop/mobile app boot
- 驗收標準：
  - 新增 shared module 時不需要靠猜測 script 順序。
  - production console 不再依賴 Babel standalone warning 作為正常狀態。
- 狀態：已完成第一版。暫不導入 build step；載入順序文件為 `SCRIPT_LOAD_ORDER.md`，並由 `ui-surface.test.mjs` 既有 boot-order 檢查保護桌機與手機入口。

## P5：清理文字編碼與翻譯來源

- 檢查目前 HTML/JS 中的亂碼文字，確認是檔案編碼問題、舊輸出殘留，還是 i18n key 缺漏。
- 將 UI 顯示文字盡量收斂到 `i18n.js`，避免桌機/手機各自硬寫一份。
- 驗收標準：
  - 桌機與手機主要入口文字不再出現亂碼。
  - 新增或修改 UI 字串時有明確 i18n 放置位置。
- 狀態：已完成第一版。`i18n-surface.test.mjs` 會檢查主入口 mojibake 標記與 landing/mobile 主要文字的 `i18n.js` 覆蓋；`package.json` 已加入 `npm run test:i18n`，完整 `npm run test` 也會執行此檢查。

## P6：讓較輕量 AI 也能可靠讀寫文章

目標是讓 `codex-5.3-spark` 這類速度快、推理成本較低的 AI，不需要理解整個 repo，也能安全讀取、改寫與新增小說文章。關鍵不是單純換模型，而是提供更清楚的文章資料介面與寫入護欄。

- 建立文章索引 API：
  - 列出 books、volumes、chapters、story markdown 檔案與穩定 ID。
  - 回傳 title、path、word count、year、status、updatedAt、sourceRefs 等摘要欄位。
  - 讓 AI 先選文章，再讀全文，避免一次塞入整個故事庫。
  - 狀態：已完成第一版，API 為 `GET /api/stories/:id/articles`。
- 建立文章讀取 API：
  - 用 ID 讀取單篇 chapter/article。
  - 回傳 frontmatter、markdown body、關聯世界資料摘要、相鄰章節摘要。
  - 對長文提供 outline / section chunks，讓小模型能分段處理。
  - 狀態：已完成第一版，API 為 `GET /api/stories/:id/articles/:articleId`。
- 建立文章寫入 API：
  - 支援 draft write，不直接覆蓋正式文章。
  - 支援 patch-based update，例如只改某一節、某段、frontmatter 欄位。
  - 每次寫入都產生 diff preview，使用者確認後才套用到 stories 目錄。
  - 狀態：已完成 draft write、patch-based draft、diff preview、使用者確認套用與版本回復。draft API 為 `POST /api/stories/:id/articles/:articleId/drafts`；套用 API 為 `POST /api/stories/:id/articles/:articleId/drafts/:draftId/apply`，需 `confirmApply: true`；版本 API 為 `GET /api/stories/:id/articles/:articleId/versions` 與 `POST /api/stories/:id/articles/:articleId/versions/:versionId/restore`，回復需 `confirmRestore: true`。
- 建立 AI 任務 schema：
  - `read_article`
  - `summarize_article`
  - `continue_article`
  - `rewrite_section`
  - `sync_article_to_world`
  - `check_consistency`
  - `propose_patch`
  - 狀態：已完成第一版，API 為 `GET /api/article-tasks`。
- 建立 context packer：
  - 自動組合目前文章、章節摘要、角色/地點/事件索引、時間線附近資料。
  - 依任務類型限制 context 大小，避免小模型被無關資料淹沒。
  - 對 Codex Spark 等級模型優先給結構化摘要，再給必要原文片段。
  - 狀態：已完成第一版，API 為 `GET /api/stories/:id/articles/:articleId/context?task=...&maxChars=...`。
- 建立寫入安全邊界：
  - AI 只能寫入 `stories/` 下的文章內容，不直接改 app code。
  - 任何覆蓋、刪除、封存文章都需要使用者確認。
  - 每次 AI 修改保留可回復版本或 draft copy。
  - 狀態：已完成第一版。draft 先寫入 `_drafts/articles/`；正式文章覆蓋需要 explicit confirm；套用與回復都會保留可回復版本。
- 建立文章品質驗證：
  - Markdown/frontmatter parse test。
  - world sync test：文章中新增角色、地點、事件時，能檢查是否同步到 world data。
  - consistency check：年份、角色生死、地點名稱、組織歸屬不得明顯矛盾。
  - 狀態：已完成第一版。正式文章品質 API 為 `GET /api/stories/:id/articles/:articleId/quality`；draft 品質 API 為 `GET /api/stories/:id/articles/:articleId/drafts/:draftId/quality`。
- 驗收標準：
  - AI 能列出文章、讀取指定文章、提出 patch、產生 diff。
  - 未經確認不會直接修改正式文章。
  - 小模型只靠索引與 context packer 就能完成單章續寫或段落改寫。
  - 所有 AI 寫入都能被測試、預覽、回復。

## 建議執行順序

1. 先做 P1，因為它會保護這次 routing 改動。
2. 再做 P3，補上桌機/手機渲染信心。
3. 接著做 P2，把共用 hook API 整理得更穩。
4. 若要讓 AI 寫文章，先做 P6 的索引 API、讀取 API、draft write，再做完整自動化。
5. P4 與 P5 視部署需求安排；若準備公開使用，優先做 P5。

## 暫不建議做

- 不建議把桌機與手機 UI 合併成單一 RWD component；目前兩者互動模型差異足夠大，分開仍合理。
- 不建議加入 localStorage 記憶 `view` 選擇；目前 `?view=` 作為明確 URL 覆蓋比較可預期。
- 不建議在 resize 時重新啟用自動跳轉；這會回到使用中突然重載的問題。
- 不建議一開始就讓 AI 直接改整份 story markdown；先用 draft + patch + diff preview 才安全。
