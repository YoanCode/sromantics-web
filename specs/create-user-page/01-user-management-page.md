# Spec 01: User Management Page

## 目標

將既有的模板 `Users` mock 頁面改為「使用者管理」頁面，並依照 `Students`、`Parents` feature 的架構使用 TanStack Query 串接後端 API。

頁面資料模型必須與 `sromantics-api/specs/user/01-user-data-model.md` 一致。前端可管理帳號、顯示名稱、email、角色與帳號狀態，但**絕不接收、顯示、快取或回傳 `passwordHash`、`tokenVersion`**。

---

## 現況與範圍

目前 `src/features/users/` 是管理後台模板，使用 mock data，且包含以下不符合後端 User Model 的欄位或行為：

- `firstName`、`lastName`、`phoneNumber`、`invited`、`suspended`
- `superadmin`、`manager`、`cashier` 等角色
- `showSubmittedData` 假送出行為
- Invite User dialog

本規格將保留既有 `/users` route、表格、對話框與 URL state 模式，改為符合真實 API 的 CRUD 頁面。

### 非目標

- 不實作登入頁、Spring Security、JWT 簽發或 token refresh。
- 不提供使用者自行變更密碼的個人設定頁。
- 不實作 email 邀請流程；目前後端 User Model 沒有 invitation entity。
- 不在前端做「目前登入者」的權限判斷；API 必須是最後的授權防線。

---

## 後端 API 前置條件

目前 API 專案只有 `User` Entity 與 Repository，尚未提供 User Controller。本頁開始實作前，後端需提供下列 endpoint；所有 response 均不得包含 `passwordHash`。

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/api/users` | — | `UserResponse[]` |
| `POST` | `/api/users` | `CreateUserRequest` | `201 UserResponse` |
| `PUT` | `/api/users/{id}` | `UpdateUserRequest` | `200 UserResponse` |
| `DELETE` | `/api/users/{id}` | — | `204` |
| `PUT` | `/api/users/{id}/password` | `ChangePasswordRequest` | `204` |

```ts
type UserRole = 'ADMIN' | 'STAFF' | 'TEACHER'

type UserResponse = {
  id: string
  username: string
  email: string
  displayName: string
  roles: UserRole[]
  enabled: boolean
  accountNonLocked: boolean
  createdAt: string // ISO-8601 Instant
  updatedAt: string // ISO-8601 Instant
}

type CreateUserRequest = {
  username: string
  email: string
  displayName: string
  password: string
  roles: UserRole[]
}

type UpdateUserRequest = {
  email: string
  displayName: string
  roles: UserRole[]
  enabled: boolean
  accountNonLocked: boolean
}

type ChangePasswordRequest = {
  password: string
}
```

> 使用者 ID 必須由後端產生。`POST` payload 不含 `id`，`PUT` 不允許變更 `username`。後端在密碼變更、帳號停用或鎖定時，應依 API User Model 規格更新 `tokenVersion`，前端不直接傳送該欄位。

---

## 檔案異動

```
src/
├── types/
│   └── user.ts                                      ← 新增 API User schema 與 type
├── features/users/
│   ├── api.ts                                       ← 新增 raw API functions
│   ├── queries.ts                                   ← 新增 TanStack Query hooks
│   ├── index.tsx                                    ← 修改，載入 query data
│   ├── data/
│   │   ├── schema.ts                                ← 移除或改為 re-export，避免舊 mock model
│   │   ├── data.ts                                  ← 修改角色選項與呈現設定
│   │   └── users.ts                                 ← 移除 mock data
│   └── components/
│       ├── users-provider.tsx                       ← 修改，提供 mutation callbacks
│       ├── users-table.tsx                          ← 修改，沿用 Parents URL table state
│       ├── users-columns.tsx                        ← 修改欄位與篩選
│       ├── users-primary-buttons.tsx                ← 修改，僅保留 Add User
│       ├── users-dialogs.tsx                        ← 修改，移除 invite dialog
│       ├── users-action-dialog.tsx                  ← 修改新增/編輯表單
│       ├── users-delete-dialog.tsx                  ← 修改，呼叫 delete mutation
│       ├── users-multi-delete-dialog.tsx            ← 修改，呼叫 delete mutation
│       ├── data-table-row-actions.tsx               ← 修改，支援編輯、重設密碼、刪除
│       └── users-*-dialog.test.tsx                  ← 修改或新增測試
└── routes/_authenticated/users/
    └── index.tsx                                    ← 修改 URL search schema
```

---

## Step 1: 建立前端 User 型別

新增 `src/types/user.ts`，以 Zod 定義 API response 及表單 payload。不要沿用 `src/features/users/data/schema.ts` 中的模板型別。

```ts
import { z } from 'zod'

export const userRoleSchema = z.enum(['ADMIN', 'STAFF', 'TEACHER'])
export type UserRole = z.infer<typeof userRoleSchema>

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  roles: z.array(userRoleSchema),
  enabled: z.boolean(),
  accountNonLocked: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type User = z.infer<typeof userSchema>

export const createUserSchema = z.object({
  username: z.string().trim().min(3, '帳號至少需 3 個字元').max(50),
  email: z.string().trim().toLowerCase().email('Email 格式不正確'),
  displayName: z.string().trim().min(1, '請輸入顯示名稱').max(100),
  password: z.string().min(8, '密碼至少需 8 個字元'),
  roles: z.array(userRoleSchema).min(1, '請至少選擇一個角色'),
})
export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email 格式不正確'),
  displayName: z.string().trim().min(1, '請輸入顯示名稱').max(100),
  roles: z.array(userRoleSchema).min(1, '請至少選擇一個角色'),
  enabled: z.boolean(),
  accountNonLocked: z.boolean(),
})
export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const changePasswordSchema = z.object({
  password: z.string().min(8, '密碼至少需 8 個字元'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
})
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
```

密碼強度規則若後端更嚴格，必須由後端回傳驗證錯誤；前端驗證只作為使用體驗改善。

---

## Step 2: 建立 API 與 Query Hooks

依照 `features/parents/api.ts` 與 `features/parents/queries.ts` 的慣例新增 `api.ts`、`queries.ts`。

```ts
// features/users/api.ts
import apiClient from '@/lib/api-client'
import type {
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
  User,
} from '@/types/user'

const BASE = '/api/users'

export const usersApi = {
  list: async (): Promise<User[]> => (await apiClient.get<User[]>(BASE)).data,
  create: async (payload: CreateUserInput): Promise<User> =>
    (await apiClient.post<User>(BASE, payload)).data,
  update: async (id: string, payload: UpdateUserInput): Promise<User> =>
    (await apiClient.put<User>(`${BASE}/${id}`, payload)).data,
  changePassword: async (id: string, payload: ChangePasswordInput): Promise<void> => {
    await apiClient.put(`${BASE}/${id}/password`, { password: payload.password })
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
```

- 使用 `USERS_KEY = ['users'] as const`。
- create、update、changePassword、delete 成功後均 invalidate `USERS_KEY`。
- 以 `sonner` 顯示成功與失敗通知。
- 使用 `axios` error response 的 message（若存在）作為失敗 toast；不可將 request 中的密碼輸出至 console 或 toast。

---

## Step 3: 調整 Provider 與頁面資料載入

`UsersProvider` 的寫法應與 `ParentsProvider` 相同，透過 context 提供以下操作，避免 dialogs 逐層傳遞 callback：

```ts
type UsersDialogType = 'add' | 'edit' | 'change-password' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (value: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  onCreate: (data: CreateUserInput) => void
  onUpdate: (id: string, data: UpdateUserInput) => void
  onChangePassword: (id: string, data: ChangePasswordInput) => void
  onDelete: (id: string) => void
  onDeleteAsync: (id: string) => Promise<void>
}
```

`features/users/index.tsx` 移除 `data/users` import，改用 `useUsersQuery()`。載入中顯示與 Parents / Students 相同的 `Loading...` 提示，資料完成後才渲染 `UsersTable`。

---

## Step 4: 使用者列表、篩選與 URL State

`UsersTable` 應比照 `ParentsTable` 使用 `useTableUrlState`、列選取、排序與分頁。

表格欄位如下：

| 欄位 | 說明 |
| --- | --- |
| 選取 | 批次刪除用途 |
| 使用者名稱 | `username`；固定欄位，可排序 |
| 顯示名稱 | `displayName`；可排序 |
| Email | `email` |
| 角色 | `roles`；以 Badge 顯示，可篩選多個角色 |
| 帳號狀態 | 依 `enabled`、`accountNonLocked` 顯示，並可篩選 |
| 最後更新 | `updatedAt` 格式化顯示 |
| 操作 | 編輯、變更密碼、刪除 |

狀態呈現規則：

| 條件 | 顯示文字 | 建議樣式 |
| --- | --- | --- |
| `enabled && accountNonLocked` | 啟用 | 綠色 Badge |
| `!enabled` | 已停用 | 灰色 Badge |
| `enabled && !accountNonLocked` | 已鎖定 | 紅色 Badge |

更新 `src/routes/_authenticated/users/index.tsx`：

```ts
const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.array(z.enum(['active', 'disabled', 'locked'])).optional().catch([]),
  role: z.array(userRoleSchema).optional().catch([]),
  username: z.string().optional().catch(''),
})
```

---

## Step 5: 新增與編輯表單

將 `users-action-dialog.tsx` 改為使用 `useUsers()` 的 mutation callbacks，並拆分為兩種明確模式。

### 新增使用者

- 欄位：`username`、`displayName`、`email`、`roles`（可複選）、`password`、`confirmPassword`。
- submit 時呼叫 `onCreate`，不產生前端 `id`。
- 成功後 reset、關閉 dialog，並讓 query invalidation 更新列表。

### 編輯使用者

- 欄位：`username`（唯讀）、`displayName`、`email`、`roles`、`enabled`、`accountNonLocked`。
- **不得**在這個表單顯示或更新密碼；密碼使用獨立 dialog，避免空白密碼覆寫問題。
- submit 時呼叫 `onUpdate(currentRow.id, payload)`。

角色選項必須為：

```ts
const roles = [
  { label: '系統管理員', value: 'ADMIN' },
  { label: '行政人員', value: 'STAFF' },
  { label: '教師', value: 'TEACHER' },
] as const
```

若既有 `SelectDropdown` 不支援多選，改用專案現有 checkbox / popover 元件實作角色複選；不得將多角色資料退化為單一 `role` 字串。

---

## Step 6: 密碼變更與刪除

新增 `users-change-password-dialog.tsx`：

- 只顯示新密碼與確認密碼欄位，使用 `PasswordInput`。
- 成功後清空表單、關閉 dialog；不保留密碼於 component state、URL 或 toast。
- API 成功時後端會遞增 `tokenVersion` 使舊 JWT 失效；前端只顯示「密碼已更新」通知。

刪除與批次刪除比照 Parents feature：

- 單筆刪除需輸入使用者名稱確認。
- 批次刪除需輸入既有的確認文字後才可送出。
- 批次操作使用 `Promise.all(ids.map(onDeleteAsync))`，成功後 reset row selection。
- 若 API 拒絕刪除目前登入者或受保護帳號，顯示 API error，保留列表資料。

移除 `users-invite-dialog.tsx`、Invite button 及 `invite` dialog state；此功能需另有 invitation API 規格後才可重新加入。

---

## 安全與資料處理要求

- API response DTO、TanStack Query cache、Table row 與所有前端 log 不得含 `passwordHash`、`tokenVersion`。
- 密碼只在建立與變更密碼表單短暫存在；送出、關閉或 API 失敗後均需 `form.reset()`。
- 不可把 password、authorization header 或完整 axios error object 寫進 toast / console。
- 前端的 disabled、locked、role UI 僅為介面；後端 API 仍必須以 Spring Security/JWT 驗證當前操作是否被允許。
- API 的 `401` 與 `403` 需有一致的全域處理（例如導向登入頁或顯示無權限），不在每個 dialog 重複實作。

---

## 測試與驗證

更新既有 user dialog 測試，並新增變更密碼 dialog 的測試。至少涵蓋：

- 新增表單的必填欄位、email、密碼確認、至少一個角色驗證。
- 編輯表單的 `username` 唯讀，且不含密碼欄位。
- 有效新增、更新、密碼變更分別呼叫正確的 Provider callback。
- 密碼變更 callback 的 payload 只包含 `password`。
- 單筆刪除在確認文字正確前不可送出。
- 批次刪除呼叫所有選取 user 的 `onDeleteAsync`。
- 表格正確呈現啟用、停用、鎖定三種狀態與多角色。

執行：

```bash
npm exec prettier -- --check src/types/user.ts src/features/users src/routes/_authenticated/users/index.tsx
npm run lint
npm run build
npm test
```

瀏覽器 smoke test：

1. 啟動 API 與 web dev server。
2. 前往 `/users`，確認列表來自 `GET /api/users` 而非 mock data。
3. 建立具有 `STAFF`、`TEACHER` 兩個角色的使用者並重新整理頁面，確認資料仍存在。
4. 停用、鎖定並重新啟用帳號，確認狀態 Badge 正確更新。
5. 變更密碼，確認 Network request 只含 `password`，且後續不會在頁面或 console 出現密碼資料。

---

## 驗收條件

- [ ] `/users` 使用 API 資料，不再使用 mock user data。
- [ ] 前端 model 與 API User Model 的 username、email、displayName、roles、enabled、accountNonLocked、timestamps 一致。
- [ ] 新增、編輯、變更密碼、單筆刪除與批次刪除都透過 TanStack Query mutations 執行。
- [ ] `roles` 支援多選，且只使用 `ADMIN`、`STAFF`、`TEACHER`。
- [ ] `passwordHash`、`tokenVersion`、明文密碼不會被顯示或存入 Query cache。
- [ ] 舊的 Invite / mock-only 欄位與流程已移除。
- [ ] URL 能保留分頁、username、角色與狀態篩選條件。
- [ ] `npm run lint`、`npm run build`、`npm test` 通過。
