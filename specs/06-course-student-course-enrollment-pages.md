# Spec 06: Course、StudentCourse 與 Enrollment 管理頁面

## 目標

在 authenticated layout 中提供三個可操作的管理頁面，沿用 Parents page 的 API、query 與 CRUD 操作模式。

## Routes

- `/courses`
- `/classes`
- `/student-courses`
- `/enrollments`
- `/attendance`

三個 route 都必須受到 authenticated route guard 保護，並出現在 sidebar。

## Course page

- 顯示課程 id、名稱、分類與描述。
- 可建立、編輯與刪除課程。
- API base path：`/api/courses`。

## StudentCourse page

- 顯示學生、課程、購買堂數、已使用堂數、剩餘堂數、付款狀態與課程狀態；不在 StudentCourse 頁面顯示單一班級。
- 可建立、編輯與刪除學生課程額度。
- API base path：`/api/student-courses`。
- 堂數欄位必須使用非負整數。
- 班級不屬於 StudentCourse；學生可透過多筆 Enrollment 在同一 Course 的不同 Class 間轉班或使用額度。

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

## Attendance page

- 顯示 Enrollment、學生、班級、日期、出席狀態與備註。
- 支援 `present`、`absent`、`late`、`excused`。
- 建立、修改或刪除出席紀錄時，由 API 同步更新 StudentCourse 堂數。
- Attendance 新增、修改或刪除成功後，前端必須重新載入 Attendance 與 StudentCourse 資料，讓堂數立即反映最新結果。
- Calendar 使用同一份 Attendance query cache，因此 Attendance 異動成功後，日曆中的缺席事件也必須同步更新。
- Enrollment 下拉選項顯示學生名稱、課程名稱、班級名稱與上課時間，不直接顯示技術 ID。
- 選擇出席日期後，Enrollment 下拉只顯示日期落在報名區間內、未取消且符合班級固定上課星期的報名紀錄。
- 變更出席日期時，清除原本選取的 Enrollment，避免提交過期或不符合日期的報名紀錄。
- 同一 Enrollment 同一天不可重複建立出席紀錄。
- API base path：`/api/attendances`。

## Acceptance criteria

- 管理頁面可從 sidebar 開啟。
- 頁面載入時從對應 API 取得資料。
- 建立、編輯、刪除成功後會重新載入列表並顯示成功提示。
- API 失敗時不會靜默吞錯誤。
- TypeScript typecheck 通過。

## Form validation rules

- Enum fields such as payment status, course status, enrollment status, and attendance status use constrained select options, not free-text inputs.
- Numeric lesson fields accept non-negative numbers only.
- `StudentCourse.usedLessons` and `remainingLessons` are read-only in the form and are updated by attendance/business logic.
- Derived display fields such as `className` are never included in create or update payloads.
- Enrollment create/update requests contain only the current enrollment fields; legacy database compatibility fields are populated by the API.
- Enrollment class options show course name, class name, weekday, and time, and must be filtered to classes belonging to the selected StudentCourse course.
- Selecting a StudentCourse dynamically filters the Class options to the matching Course.
- Changing StudentCourse clears the previously selected Class to prevent submitting a stale incompatible classId.
- StudentCourse create forms must include `enrolledAt`; the API defaults it to the current date only as a defensive fallback.

## Relationship selectors

- Student `parentId` uses a parent-name selector.
- Class `courseId` uses a course-name selector.
- StudentCourse `studentId` uses a student-name selector and `courseId` uses a course-name selector.
- Enrollment `studentCourseId` and `classId` use loaded relationship selectors.
- Attendance `enrollmentId` uses a loaded enrollment selector.
- Date fields use date controls and weekday fields use bounded options instead of free text.
- Management tables hide technical IDs and display human-readable names; IDs remain internal values in API payloads.

## Mock data scenario

Mock data 必須包含一個跨班轉移案例：

- `sc_001` 購買 20 堂，已使用 3 堂，剩餘 17 堂。
- `e_001` 對應原本的 `cl_001`，狀態為 `transferred`，結束日為 `2026-08-20`。
- `e_003` 使用相同的 `studentCourseId` 對應新的 `cl_003`，狀態為 `active`，開始日為 `2026-08-21`。
- 轉班前後堂數仍由同一筆 `StudentCourse` 管理，不得複製或切分堂數。
