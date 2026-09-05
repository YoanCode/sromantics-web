import type { Course } from '@/types/mds'
import apiClient from '@/lib/api-client'

const BASE = '/api/courses'

export const coursesApi = {
  list: async (): Promise<Course[]> => (await apiClient.get<Course[]>(BASE)).data,
  create: async (payload: Omit<Course, 'id'>): Promise<Course> =>
    (await apiClient.post<Course>(BASE, payload)).data,
  update: async (id: string, payload: Course): Promise<Course> =>
    (await apiClient.put<Course>(`${BASE}/${id}`, payload)).data,
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
