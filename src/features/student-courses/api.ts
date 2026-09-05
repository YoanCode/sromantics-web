import type { StudentCourse } from '@/types/mds'
import apiClient from '@/lib/api-client'

const BASE = '/api/student-courses'

export const studentCoursesApi = {
  list: async (): Promise<StudentCourse[]> =>
    (await apiClient.get<StudentCourse[]>(BASE)).data,
  create: async (payload: Omit<StudentCourse, 'id'>): Promise<StudentCourse> =>
    (await apiClient.post<StudentCourse>(BASE, payload)).data,
  update: async (id: string, payload: StudentCourse): Promise<StudentCourse> =>
    (await apiClient.put<StudentCourse>(`${BASE}/${id}`, payload)).data,
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
