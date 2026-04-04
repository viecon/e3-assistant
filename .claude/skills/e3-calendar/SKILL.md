---
name: e3-calendar
description: 查看 E3 行事曆事件，產生 ICS 檔案訂閱到 iOS/Google Calendar
---

# E3 行事曆

```bash
# 未來 7 天
e3 calendar --json

# 未來 30 天
e3 calendar --days 30 --json

# 產生 .ics 檔（作業截止日 + 考試）
e3 calendar --ics

# 自訂天數和檔名
e3 calendar --ics my-calendar.ics --ics-days 120
```

ICS 包含 E3 作業截止日 + `~/.e3-exams.json`（或 repo 裡的 `exams.json`）手動加的考試。
產生後可訂閱到 iOS 行事曆 / Google Calendar / Timetree。
