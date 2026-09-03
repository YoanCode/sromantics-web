import apiClient from '@/lib/api-client'
import type {
  AdminResetPasswordInput,
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
  changePassword: async (
    id: string,
    payload: ChangePasswordInput
  ): Promise<void> => {
    await apiClient.put(`${BASE}/${id}/password`, {
      currentPassword: payload.currentPassword,
      password: payload.password,
    })
  },
  adminResetPassword: async (
    id: string,
    payload: AdminResetPasswordInput
  ): Promise<void> => {
    await apiClient.post(`${BASE}/admin/${id}/password/reset`, {
      newPassword: payload.newPassword,
    })
  },
  unlockUser: async (id: string): Promise<void> => {
    await apiClient.post(`${BASE}/admin/${id}/unlock`)
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
