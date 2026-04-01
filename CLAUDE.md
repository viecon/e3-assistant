# E3 Assistant

NYCU E3 LMS 助手工具，包含瀏覽器 Extension、CLI 工具和 Claude Code Skills。

## 專案結構

- `packages/core/` - 共享 Moodle API 客戶端 (TypeScript library)
- `packages/cli/` - CLI 工具 (`e3` 指令)
- `packages/extension/` - 瀏覽器 Extension (Chrome + Firefox/Zen)
- `.claude/skills/` - Claude Code Skills

## 開發指令

```bash
# 安裝依賴
pnpm install

# 建置全部
pnpm build

# CLI 開發
node packages/cli/dist/bin/e3.js --help

# Extension 開發 (Chrome)
pnpm dev

# Extension 開發 (Firefox/Zen)
pnpm dev:firefox

# Extension 建置
cd packages/extension && npx wxt build         # Chrome
cd packages/extension && npx wxt build --browser firefox  # Firefox
```

## E3 API

基於 Moodle REST API，基底 URL: `https://e3p.nycu.edu.tw`
- 認證: `/login/token.php` (取得 token)
- API: `/webservice/rest/server.php?wstoken=TOKEN&moodlewsrestformat=json&wsfunction=FUNCTION`
- 上傳: `/webservice/upload.php`

## Skills

CLI 工具的所有指令都支援 `--json` 輸出，方便 skills 解析。
使用前需先 `e3 login` 取得 token。
