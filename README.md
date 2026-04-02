# E3 Assistant

NYCU E3 LMS 助手工具 — 讓交大 E3 更好用。

## 功能

### 🖥️ 瀏覽器 Extension (Chrome + Zen Browser)
- **未完成作業追蹤** — 依截止日標色（紅/黃/綠）
- **課程瀏覽** — 快速開啟課程、批次下載教材
- **批次上傳** — 拖放多個檔案一次提交作業
- **截止日時間軸** — 視覺化近期 deadline
- **成績總覽** — 各課程成績一覽
- **E3 頁面增強** — 浮動按鈕、課程頁面批次下載按鈕

### ⌨️ CLI 工具
```bash
e3 login --token <token>     # 登入
e3 courses                   # 列出課程
e3 assignments               # 未完成作業
e3 download <course-id>      # 下載教材
e3 upload <id> file1 file2   # 上傳作業
e3 grades                    # 查看成績
e3 calendar                  # 行事曆
e3 sync                      # 同步到 Obsidian
```

### 🤖 Claude Code Skills
在 Claude Code 中直接操作 E3：
- `/e3-courses` — 列出課程
- `/e3-assignments` — 查看作業
- `/e3-download` — 下載教材
- `/e3-sync` — 同步講義到 Obsidian + AI 生成筆記

### 📝 Obsidian 自動同步 Workflow
- 下載新講義到 `{課程}/slides/`
- 用 Python 提取投影片文字（PDF/PPTX/DOCX）
- Claude Code 讀取內容生成結構化筆記
- 同步作業到 Obsidian Calendar
- 支援 Windows Task Scheduler 排程

## 安裝

### 前置需求
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Python 3 (for slide extraction)

### 建置
```bash
pnpm install
pnpm build

# Extension
cd packages/extension
npx wxt build              # Chrome
npx wxt build --browser firefox  # Firefox/Zen
```

### CLI 登入
E3 使用交大 SSO + 2FA，需要手動取得 token：
```bash
# 方式 1: 帳號密碼（需在 E3 設定中放寬 2FA）
node packages/cli/dist/bin/e3.js login --token <token>

# 方式 2: Session cookie（從瀏覽器複製）
node packages/cli/dist/bin/e3.js login --session <MoodleSession>
```

### Extension 安裝
**Chrome**: `chrome://extensions` → 開發者模式 → 載入 `packages/extension/.output/chrome-mv3`

**Zen Browser**: `about:debugging` → 載入暫時性附加元件 → 選 `.output/firefox-mv2/manifest.json`

## 專案結構

```
├── packages/
│   ├── core/          # 共享 Moodle API 客戶端
│   ├── cli/           # CLI 工具
│   └── extension/     # 瀏覽器 Extension (WXT + React)
├── scripts/
│   ├── e3-sync.bat    # 自動同步 workflow
│   ├── extract-slides.py  # 投影片文字提取
│   └── find-stubs.js  # 找需要 AI 填入的空筆記
└── .claude/skills/    # Claude Code Skills
```

## License

MIT
