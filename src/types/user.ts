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
  password: z.string().min(8, '密碼至少需 8 個字元').max(72),
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

/**
 * 密碼強度指示器
 * 需要：8-72 字符，大寫字母、小寫字母、數字或特殊字符
 */
export function getPasswordStrength(password: string) {
  if (!password) return { level: 'empty', color: 'gray' }
  
  const checks = [
    password.length >= 8 && password.length <= 72,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9!@#$%^&*]/.test(password),
  ]
  
  const passed = checks.filter(Boolean).length
  
  if (passed <= 2) return { level: 'weak', color: 'red' }
  if (passed <= 3) return { level: 'fair', color: 'yellow' }
  return { level: 'good', color: 'green' }
}
