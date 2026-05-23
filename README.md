# Novel Elf

Novel Elf 是一個面向小說、世界觀設定與長篇敘事開發的互動式設定集工具。專案目前以 `The Atelier of Aevenmere` 作為展示故事，提供地圖、時間軸、角色/組織/國家資料、章節資料庫與文章輔助工作流，協助作者把世界設定、劇情事件與正文素材維持在同一個可瀏覽、可編輯的工作區中。

這個專案採用靜態 HTML、瀏覽器端 React UMD、Babel standalone 與自製 Node.js 開發伺服器。故事資料可透過本機 Markdown 檔案保存，也能在沒有 API 伺服器時退回瀏覽器 `localStorage` 模式。

## 核心功能特性

- 互動式世界地圖：瀏覽地點、區域、勢力範圍與不同年份下的世界狀態。
- 多軌時間軸：依年份檢視事件、角色、組織與國家的生命週期和關聯。
- 設定資料管理：建立、編輯、刪除事件、角色、組織、國家與關係資料。
- 書庫與章節工作區：以書籍、卷、章節管理故事文本，並將章節來源連回世界觀資料。
- 桌面與行動版入口：提供桌面工作台與手機展示版，入口會依 viewport 或 `?view=` 參數切換。
- Markdown 故事儲存：將故事拆成 `story.md`、`atlas.md`、`characters/`、`events/`、`library/` 等結構化 Markdown。
- 本機資料隔離：預設使用 `.local/stories/` 儲存私人作品，避免把私有寫作內容誤提交到公開範例資料。
- 文章輔助 API：支援文章列表、上下文包、草稿、品質檢查、版本還原與套用草稿等開發伺服器端點。
- AI 輔助鉤子：前端保留 `window.claude.complete` 介面，可用於角色、事件、組織、國家與章節續寫輔助。
- Node 內建測試：涵蓋 Markdown 故事格式、API、匯入、viewport router、UI 載入順序與 i18n 介面。

## 系統需求與安裝步驟

### 系統需求

- Node.js 18 或更新版本。
- npm，通常會隨 Node.js 一併安裝。
- 現代瀏覽器，例如 Chrome、Edge、Firefox 或 Safari。
- 可連線到 CDN 的網路環境，因為目前桌面與行動入口會從 unpkg 載入 React、ReactDOM 與 Babel standalone。

### 安裝

```powershell
git clone <repository-url>
cd novel_elf
npm install
```

> 目前 `package.json` 沒有宣告額外 npm dependencies；`npm install` 主要用來讓本機環境與 npm 專案慣例保持一致。

## 快速上手與使用範例

### 啟動私人寫作工作區

一般開發與日常寫作請使用預設指令。故事資料會儲存在 `.local/stories/`，此目錄已被 `.gitignore` 排除。

```powershell
npm run dev
```

啟動後開啟：

```text
http://localhost:8789/
```

如果要限制只有本機可連線：

```powershell
npm run dev:local
```

### 啟動公開示範故事

若要使用版本庫內的 `stories/` 範例資料：

```powershell
npm run dev:demo
```

若需要讓同一區網中的其他裝置連線示範：

```powershell
npm run dev:demo:lan
```

### 指定外部故事資料夾

可以把私人故事放在專案外部，避免與程式碼倉庫混在一起：

```powershell
node dev-server.mjs --host 127.0.0.1 --port 8789 --stories-root C:\Users\user\Documents\novel_elf_private_stories
```

### LLMwiki 與寫作 SOP

本專案把可被 UI、API 與 LLM 使用的故事資料稱為 LLMwiki，也就是每個故事底下的結構化 Markdown 目錄。若要把作者的人類設定集轉成 LLMwiki，請依照 [human-settings-to-llmwiki.sop.md](docs/sop/human-settings-to-llmwiki.sop.md)。若要根據 LLMwiki 撰寫或續寫正文，請依照 [write-story-from-llmwiki.sop.md](docs/sop/write-story-from-llmwiki.sop.md)。

人類原始設定集請放在 `.local/source-settings/<story-id>/`，或放在專案外部的私人資料夾。LLMwiki 內容請放在 `.local/stories/<story-id>/`；只有公開展示用故事才放在 `stories/<story-id>/`。不要把原始設定集放進 LLMwiki 故事根目錄，因為故事儲存流程會管理該目錄內的 Markdown 檔。

每次請 LLM 寫作前，先確認 `storyId`、`targetArticleId`、正式章節路徑、草稿路徑、要接續的文章，以及本次使用的背景資料來源。寫作流程必須記錄 sub-agent 與 skill：有專用 Codex story skill 就先使用；沒有時使用本專案 SOP 作為 project writing skill；正式寫作前至少派一個 continuity sub-agent 檢查世界觀、時間線、角色狀態與銜接風險。若無法使用 sub-agent 或 skill，任務必須標示為 `blocked`，不得宣稱符合 SOP。正式正文保存到 `library/<book-id>/<volume-id>/<chapter-id>.md`，草稿與版本保存在 `_drafts/articles/`。

### 直接開啟特定入口

```text
http://localhost:8789/Aevenmere%20Atelier.html?view=desktop
http://localhost:8789/Aevenmere%20Atelier%20-%20Mobile.html?view=mobile
```

### 執行測試

```powershell
npm run test
```

也可以執行較聚焦的測試：

```powershell
npm run test:router
npm run test:ui
npm run test:i18n
```

## 專案架構說明

```text
novel_elf/
├─ index.html                         # 部署入口頁，依裝置導向桌面或行動版
├─ Aevenmere Atelier.html             # 桌面版 React/Babel 入口
├─ Aevenmere Atelier - Mobile.html    # 行動版 React/Babel 入口
├─ package.json                       # npm scripts 與 Node ESM 設定
├─ dev-server.mjs                     # 靜態檔案伺服器與故事/文章 API
├─ data.js                            # Aevenmere 範例世界種子資料
├─ core.js                            # 世界觀查詢、年份解析、來源索引等共用工具
├─ story-store.js                     # 前端故事載入、儲存與 localStorage 後援
├─ story-md.mjs                       # Markdown 故事讀寫、正規化與歸檔工具
├─ story-articles.mjs                 # 文章、章節、草稿與品質檢查 API 邏輯
├─ story-import.js                    # Markdown 匯入範本與解析器
├─ workspace-state.jsx                # 桌面/行動共用 React 工作區狀態 hook
├─ app.jsx                            # 桌面版主應用
├─ mobile.jsx                         # 行動版主應用
├─ map.jsx                            # 世界地圖 UI
├─ timeline.jsx                       # 時間軸 UI
├─ inspector.jsx                      # 資料列表與檢視面板
├─ details.jsx                        # 實體詳細資料編輯介面
├─ codex.jsx                          # 設定集/輔助面板
├─ library.jsx                        # 書庫介面
├─ chapter.jsx                        # 章節閱讀與編輯介面
├─ ai.js                              # AI 生成與續寫輔助函式
├─ *.css                              # 桌面、行動、時間軸、書庫與 Codex 樣式
├─ *.test.mjs                         # Node 內建測試
├─ docs/sop/                          # LLMwiki 轉換與寫作 SOP
├─ stories/                           # 可提交的公開展示故事資料
├─ assets/                            # 品牌圖示與世界地圖素材
├─ screenshots/                       # README/展示用畫面截圖
├─ DATA_ISOLATION.md                  # 私人資料與公開示範資料的隔離策略
└─ SCRIPT_LOAD_ORDER.md               # HTML script 載入順序契約
```

### 故事 Markdown 結構

開發伺服器會把每個故事儲存成一個資料夾，例如：

```text
.local/stories/my-story/
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
├─ library/
└─ _drafts/articles/
```

`stories/` 目錄用於公開展示；`.local/stories/`、`private-stories/` 與 `stories-private/` 則保留給私人寫作資料，預設不會被 Git 追蹤。人類原始設定集建議放在 `.local/source-settings/<story-id>/` 或專案外部資料夾，與 LLMwiki 故事根目錄分開保存。

## 授權條款

本專案採用 [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) 授權。

使用、修改與散布本專案時，請遵守 Apache License 2.0 的條款，包括保留版權聲明、授權聲明，以及在必要時標示修改內容。完整授權文字請參考 Apache Software Foundation 公布的 Apache License 2.0。
