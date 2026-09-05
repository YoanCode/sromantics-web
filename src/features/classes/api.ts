import type { Class } from '@/types/mds'
import apiClient from '@/lib/api-client'

const BASE = '/api/classes'

export const classesApi = {
  list: async (): Promise<Class[]> => (await apiClient.get<Class[]>(BASE)).data,
  create: async (payload: Omit<Class, 'id'>): Promise<Class> =>
    (await apiClient.post<Class>(BASE, payload)).data,
  update: async (id: string, payload: Class): Promise<Class> =>
    (await apiClient.put<Class>(`${BASE}/${id}`, payload)).data,
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
