# Spec 06: Course、StudentCourse 與 Enrollment 管理頁面

## 目標

在 authenticated layout 中提供三個可操作的管理頁面，沿用 Parents page 的 API、query 與 CRUD 操作模式。

## Routes

- `/courses`
- `/classes`
- `/student-courses`
- `/enrollments`

三個 route 都必須受到 authenticated route guard 保護，並出現在 sidebar。

## Course page

- 顯示課程 id、名稱、分類與描述。
- 可建立、編輯與刪除課程。
- API base path：`/api/courses`。

## StudentCourse page

- 顯示學生 id、課程 id、目前 active class name、購買堂數、已使用堂數、剩餘堂數、付款狀態與課程狀態。
- 可建立、編輯與刪除學生課程額度。
- API base path：`/api/student-courses`。
- 堂數欄位必須使用非負整數。
- `className` 是由 active `Enrollment.classId` 對應 `Class.className` 後的唯讀顯示欄位，不寫回 `StudentCourse`。

## Class page

- 顯示課程、班級名稱、教師、教室、星期、上下課時間、容量與單堂價格。
- 可建立、編輯與刪除固定班次。
- API base path：`/api/classes`。
- `dayOfWeek` 必須介於 1 到 7，容量與價格不得為負數。

## Enrollment page

- 顯示 StudentCourse id、Class id、Class name、開始日期、結束日期與狀態。
- 可建立、編輯與刪除班級加入紀錄。
- API base path：`/api/enrollments`。
- 支援將紀錄標記為 `transferred`，保留轉班歷史。
- `className` 由 `classId` 對應 `Class.className` 後顯示，不寫回 `Enrollment`。

## Acceptance criteria

- 三個頁面可從 sidebar 開啟。
- 頁面載入時從對應 API 取得資料。
- 建立、編輯、刪除成功後會重新載入列表並顯示成功提示。
- API 失敗時不會靜默吞錯誤。
- TypeScript typecheck 通過。

## Mock data scenario

Mock data 必須包含一個跨班轉移案例：

- `sc_001` 購買 20 堂，已使用 3 堂，剩餘 17 堂。
- `e_001` 對應原本的 `cl_001`，狀態為 `transferred`，結束日為 `2026-08-20`。
- `e_003` 使用相同的 `studentCourseId` 對應新的 `cl_003`，狀態為 `active`，開始日為 `2026-08-21`。
- 轉班前後堂數仍由同一筆 `StudentCourse` 管理，不得複製或切分堂數。
