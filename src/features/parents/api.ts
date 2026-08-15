import type { Parent } from '@/types/mds'
import apiClient from '@/lib/api-client'

const BASE = '/api/parents'

export const parentsApi = {
  list: async (): Promise<Parent[]> => {
    const { data } = await apiClient.get<Parent[]>(BASE)
    return data
  },

  create: async (payload: Omit<Parent, 'id'>): Promise<Parent> => {
    const { data } = await apiClient.post<Parent>(BASE, payload)
    return data
  },

  update: async (id: string, payload: Parent): Promise<Parent> => {
    const { data } = await apiClient.put<Parent>(`${BASE}/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
