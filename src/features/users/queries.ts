import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AdminResetPasswordInput, ChangePasswordInput, UpdateUserInput } from '@/types/user'
import { usersApi } from './api'

export const USERS_KEY = ['users'] as const

export function useUsersQuery() {
  return useQuery({ queryKey: USERS_KEY, queryFn: usersApi.list })
}

function useUsersMutation<TData>(
  mutationFn: (data: TData) => Promise<unknown>,
  successMessage: string,
  errorMessage: string
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success(successMessage)
    },
    onError: () => toast.error(errorMessage),
  })
}

export function useCreateUserMutation() {
  return useUsersMutation(usersApi.create, '使用者已建立。', '建立使用者失敗。')
}

export function useUpdateUserMutation() {
  return useUsersMutation(
    ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersApi.update(id, data),
    '使用者已更新。',
    '更新使用者失敗。'
  )
}

export function useChangePasswordMutation() {
  return useUsersMutation(
    ({ id, data }: { id: string; data: ChangePasswordInput }) =>
      usersApi.changePassword(id, data),
    '密碼已更新。',
    '更新密碼失敗。'
  )
}

export function useAdminResetPasswordMutation() {
  return useUsersMutation(
    ({ id, data }: { id: string; data: AdminResetPasswordInput }) =>
      usersApi.adminResetPassword(id, data),
    '使用者密碼已重置。',
    '重置密碼失敗。'
  )
}

export function useUnlockUserMutation() {
  return useUsersMutation(
    (id: string) => usersApi.unlockUser(id),
    '使用者帳戶已解鎖。',
    '解鎖使用者失敗。'
  )
}

export function useDeleteUserMutation() {
  return useUsersMutation(usersApi.delete, '使用者已刪除。', '刪除使用者失敗。')
}
