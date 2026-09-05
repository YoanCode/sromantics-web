import type { Enrollment } from '@/types/mds'
import apiClient from '@/lib/api-client'

const BASE = '/api/enrollments'

export const enrollmentsApi = {
  list: async (): Promise<Enrollment[]> =>
    (await apiClient.get<Enrollment[]>(BASE)).data,
  create: async (payload: Omit<Enrollment, 'id'>): Promise<Enrollment> =>
    (await apiClient.post<Enrollment>(BASE, payload)).data,
  update: async (id: string, payload: Enrollment): Promise<Enrollment> =>
    (await apiClient.put<Enrollment>(`${BASE}/${id}`, payload)).data,
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
