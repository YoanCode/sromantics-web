# Spec 02: User Password Management

## 目標

在現有使用者管理頁面上，添加密碼管理功能：
- 管理員可重置用戶密碼
- 管理員可解鎖被鎖定的賬戶
- 用戶自己可變更密碼（驗證當前密碼）
- 簡化的密碼強度提示

本規格對應後端：
```
sromantics-api/specs/user/04-user-password-management.md
```

---

## 現況與範圍

現有 `01-user-management-page.md` 已實現基本的用戶 CRUD。本規格在此基礎上添加密碼管理功能，**不創建新頁面**，而是在現有頁面上擴展。

### 非目標

- 不實作忘記密碼功能（改用「聯繫管理員」提示）
- 不實作密碼過期提醒
- 不實作密碼歷史記錄
- 不實作登入審計日誌頁面

---

## 後端 API 前置條件

後端需提供下列新增 endpoint（基於 Spec 04）：

| Method | Path | Request | Response |
|--------|------|---------|----------|
| `PUT` | `/api/users/{id}/password` | `ChangePasswordRequest` | `204` |
| `POST` | `/api/admin/users/{id}/password/reset` | `AdminResetPasswordRequest` | `204` |
| `POST` | `/api/admin/users/{id}/unlock` | — | `204` |

### API 契約

```typescript
// 修改後的變更密碼請求（用戶自己改）
type ChangePasswordRequest = {
  currentPassword: string  // ← 新增：驗證當前密碼
  password: string
}

// 管理員重置密碼請求
type AdminResetPasswordRequest = {
  newPassword: string
}
```

---

## 檔案異動

```
src/
├── types/
│   └── user.ts                                      ← 修改，更新 ChangePasswordRequest
├── features/users/
│   ├── api.ts                                       ← 修改，添加新 API 方法
│   ├── queries.ts                                   ← 修改，添加新 mutations
│   ├── components/
│   │   ├── admin-reset-password-dialog.tsx         ← 新增 (管理員重置密碼)
│   │   ├── data-table-row-actions.tsx              ← 修改，添加菜單項
│   │   └── users-dialogs.tsx                       ← 修改，導入新對話框
│   │
│   └── types/user.ts                               ← 可選，若分離類型
│
└── routes/auth/sign-in/
    └── components/user-auth-form.tsx               ← 修改，移除"忘記密碼"連結
```

---

## Step 1: 更新型別定義

修改 `src/types/user.ts`：

```typescript
import { z } from 'zod'

// 既有 schemas...

// 修改：添加 currentPassword 驗證
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, '當前密碼至少需 8 個字元'),
    password: z.string().min(8, '新密碼至少需 8 個字元').max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '新密碼不一致',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// 新增：管理員重置密碼
export const adminResetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, '密碼長度需至少 8 個字元').max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '密碼不一致',
    path: ['confirmPassword'],
  })

export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>

// 新增：密碼強度指示
export function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9!@#$%^&*]/.test(password),
  ]
  
  const passed = checks.filter(Boolean).length
  
  if (passed <= 2) return { level: 'weak', color: 'red' }
  if (passed <= 3) return { level: 'fair', color: 'orange' }
  return { level: 'good', color: 'green' }
}
```

---

## Step 2: 擴展 API 層

修改 `src/features/users/api.ts`，添加新方法：

```typescript
import apiClient from '@/lib/api-client'
import type {
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
  User,
  AdminResetPasswordInput,
} from '@/types/user'

const BASE = '/api/users'
const ADMIN_BASE = '/api/admin/users'

export const usersApi = {
  // 既有方法...
  
  // 修改：用戶自己變更密碼（需驗證當前密碼）
  changePassword: async (
    id: string,
    payload: ChangePasswordInput
  ): Promise<void> => {
    await apiClient.put(`${BASE}/${id}/password`, {
      currentPassword: payload.currentPassword,
      password: payload.password,
    })
  },
  
  // 新增：管理員重置用戶密碼
  adminResetPassword: async (
    id: string,
    payload: AdminResetPasswordInput
  ): Promise<void> => {
    await apiClient.post(`${ADMIN_BASE}/${id}/password/reset`, {
      newPassword: payload.newPassword,
    })
  },
  
  // 新增：管理員解鎖賬戶
  unlockUser: async (id: string): Promise<void> => {
    await apiClient.post(`${ADMIN_BASE}/${id}/unlock`)
  },
}
```

---

## Step 3: 擴展 Query Hooks

修改 `src/features/users/queries.ts`，添加新 mutations：

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  ChangePasswordInput,
  UpdateUserInput,
  AdminResetPasswordInput,
} from '@/types/user'
import { usersApi } from './api'

export const USERS_KEY = ['users'] as const

// 既有 hooks...

export function useAdminResetPasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminResetPasswordInput }) =>
      usersApi.adminResetPassword(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success('密碼已重置')
    },
    onError: () => toast.error('重置密碼失敗'),
  })
}

export function useUnlockUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.unlockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success('賬戶已解鎖')
    },
    onError: () => toast.error('解鎖失敗'),
  })
}
```

---

## Step 4: 更新 Provider 上下文

修改 `src/features/users/components/users-provider.tsx`，添加新操作：

```typescript
type UsersDialogType = 'add' | 'edit' | 'change-password' | 'delete' | 'admin-reset-password'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (value: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  onCreate: (data: CreateUserInput) => void
  onUpdate: (id: string, data: UpdateUserInput) => void
  onChangePassword: (id: string, data: ChangePasswordInput) => void
  onAdminResetPassword: (id: string, data: AdminResetPasswordInput) => void  // 新增
  onUnlockUser: (id: string) => void  // 新增
  onDelete: (id: string) => void
  onDeleteAsync: (id: string) => Promise<unknown>
}

export function UsersProvider({ children }: { children: React.ReactNode }) {
  // 既有代碼...
  const adminResetPasswordMutation = useAdminResetPasswordMutation()
  const unlockUserMutation = useUnlockUserMutation()

  return (
    <UsersContext
      value={{
        // 既有值...
        onAdminResetPassword: (id, data) =>
          adminResetPasswordMutation.mutate({ id, data }),
        onUnlockUser: (id) => unlockUserMutation.mutate(id),
      }}
    >
      {children}
    </UsersContext>
  )
}
```

---

## Step 5: 新增管理員重置密碼對話框

新增 `src/features/users/components/admin-reset-password-dialog.tsx`：

```tsx
'use client'

import { useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { AdminResetPasswordInput, User } from '@/types/user'
import { adminResetPasswordSchema, getPasswordStrength } from '@/types/user'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { Badge } from '@/components/ui/badge'
import { useUsers } from './users-provider'

type AdminResetPasswordDialogProps = {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: AdminResetPasswordDialogProps) {
  const { onAdminResetPassword } = useUsers()
  const form = useForm<AdminResetPasswordInput>({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const newPassword = form.watch('newPassword')
  const { level, color } = getPasswordStrength(newPassword)

  const onSubmit = useCallback(
    (values: AdminResetPasswordInput) => {
      onAdminResetPassword(user.id, values)
      form.reset()
      onOpenChange(false)
    },
    [user.id, form, onAdminResetPassword, onOpenChange]
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>重置密碼</DialogTitle>
          <DialogDescription>
            為 {user.username} 設置新密碼
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密碼</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete='new-password'
                      placeholder='至少 8 個字元'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {newPassword && (
                    <div className='mt-2 flex items-center gap-2'>
                      <div className={`h-1 w-16 rounded bg-${color}-500`} />
                      <Badge variant='outline'>{level}</Badge>
                    </div>
                  )}
                  <p className='text-xs text-gray-500 mt-1'>
                    需包含大寫字母、小寫字母、數字或特殊字符
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>確認密碼</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete='new-password'
                      placeholder='再次輸入密碼'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit'>重置密碼</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Step 6: 更新行操作菜單

修改 `src/features/users/components/data-table-row-actions.tsx`，添加新菜單項：

```tsx
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { KeyRound, Lock, Trash2, UserPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/types/user'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            編輯
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          
          {/* 新增：變更密碼（用戶自己） */}
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('change-password')
            }}
          >
            變更密碼
            <DropdownMenuShortcut>
              <KeyRound size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* 新增：重置密碼（管理員） */}
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('admin-reset-password')
            }}
          >
            重置密碼
            <DropdownMenuShortcut>
              <Lock size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          
          {/* 新增：解鎖賬戶（僅當賬戶被鎖定時顯示） */}
          {!row.original.accountNonLocked && (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                // 直接解鎖，無需對話框
                // onUnlockUser 在 MenuItemClick 時呼叫
              }}
            >
              解鎖賬戶
              <DropdownMenuShortcut>
                <Lock size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className='text-red-500'
          >
            刪除
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
```

---

## Step 7: 更新對話框管理

修改 `src/features/users/components/users-dialogs.tsx`，添加新對話框：

```tsx
import { AdminResetPasswordDialog } from './admin-reset-password-dialog'
import { UsersActionDialog } from './users-action-dialog'
import { UsersChangePasswordDialog } from './users-change-password-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  
  return (
    <>
      {/* 既有對話框... */}
      
      {currentRow && (
        <>
          {/* 新增：管理員重置密碼對話框 */}
          <AdminResetPasswordDialog
            key={`admin-reset-password-${currentRow.id}`}
            open={open === 'admin-reset-password'}
            onOpenChange={() => {
              setOpen('admin-reset-password')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            user={currentRow}
          />
        </>
      )}
    </>
  )
}
```

---

## Step 8: 修改 Sign-in 頁面

修改 `src/features/auth/sign-in/components/user-auth-form.tsx`，移除"忘記密碼"連結或改為提示：

```tsx
// 移除或註解掉這行：
// <Link to='/forgot-password' className='...'>
//   Forgot password?
// </Link>

// 替換為（可選）：
<p className='text-xs text-muted-foreground'>
  忘記密碼？請聯繫系統管理員。
</p>
```

---

## Step 9: 修改變更密碼對話框

修改 `src/features/users/components/users-change-password-dialog.tsx`，添加當前密碼驗證：

```tsx
// 更新表單以包含 currentPassword
export function UsersChangePasswordDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersChangePasswordDialogProps) {
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  })
  
  // 表單字段應包含：
  // - currentPassword (新增)
  // - password
  // - confirmPassword
}
```

---

## 密碼強度指示

所有密碼輸入表單應顯示實時的密碼強度提示：

```tsx
const { level, color } = getPasswordStrength(newPassword)

return (
  <div className='mt-2'>
    <div className={`h-1 w-full rounded bg-${color}-500`} />
    <p className='text-xs text-gray-500 mt-1'>
      強度: {level}
    </p>
    <p className='text-xs text-gray-400'>
      需包含：大寫字母、小寫字母、數字或特殊字符
    </p>
  </div>
)
```

---

## 用戶流程

### 用戶自己變更密碼

```
User List
  ↓ (點擊"變更密碼")
Change Password Dialog
  ├─ 輸入當前密碼（驗證）
  ├─ 輸入新密碼 + 確認
  ├─ 實時密碼強度提示
  └─ 提交 PUT /api/users/{id}/password
```

### 管理員重置用戶密碼

```
User List
  ↓ (點擊"重置密碼")
Admin Reset Password Dialog
  ├─ 輸入新密碼 + 確認（無需驗證舊密碼）
  ├─ 實時密碼強度提示
  └─ 提交 POST /api/admin/users/{id}/password/reset
```

### 管理員解鎖賬戶

```
User List (過濾/搜尋 accountNonLocked = false 的用戶)
  ↓ (點擊"解鎖賬戶")
  └─ 直接呼叫 POST /api/admin/users/{id}/unlock
     (無對話框確認)
```

---

## 錯誤處理

| 狀況 | 顯示消息 |
|------|---------|
| 當前密碼錯誤 | "當前密碼錯誤" |
| 新密碼強度不符 | "密碼必須包含大寫字母、小寫字母、數字或特殊字符" |
| 新舊密碼不一致 | "新密碼不一致" |
| API 錯誤 | "重置密碼失敗" / "解鎖失敗" |

---

## 測試用例

```tsx
// 密碼強度指示
describe('getPasswordStrength', () => {
  it('returns weak for short password', () => {
    expect(getPasswordStrength('pass')).toMatchObject({ level: 'weak' })
  })
  
  it('returns good for valid password', () => {
    expect(getPasswordStrength('Password123')).toMatchObject({ level: 'good' })
  })
})

// 表單驗證
describe('AdminResetPasswordDialog', () => {
  it('shows password strength indicator', () => {
    render(<AdminResetPasswordDialog ... />)
    userEvent.type(screen.getByLabelText('New Password'), 'Password123')
    expect(screen.getByText('good')).toBeInTheDocument()
  })
  
  it('requires password confirmation', () => {
    // 測試 confirmPassword 驗證
  })
})
```

---

## 實現順序

1. **型別更新**: 修改 `types/user.ts`
2. **API 層**: 擴展 `features/users/api.ts`
3. **Query Hooks**: 擴展 `features/users/queries.ts`
4. **Provider**: 更新 `users-provider.tsx`
5. **新對話框**: 創建 `admin-reset-password-dialog.tsx`
6. **菜單項**: 修改 `data-table-row-actions.tsx`
7. **對話框管理**: 修改 `users-dialogs.tsx`
8. **簽入頁面**: 修改 `user-auth-form.tsx`
9. **變更密碼對話框**: 改進 `users-change-password-dialog.tsx`
10. **測試**: 添加單元和集成測試
