import type { Attendance } from '@/types/mds'
import apiClient from '@/lib/api-client'

const BASE = '/api/attendances'

export const attendanceApi = {
  list: async (): Promise<Attendance[]> => (await apiClient.get<Attendance[]>(BASE)).data,
  create: async (payload: Omit<Attendance, 'id' | 'studentCourseId' | 'classId' | 'recordedAt'>): Promise<Attendance> =>
    (await apiClient.post<Attendance>(BASE, payload)).data,
  update: async (id: string, payload: Attendance): Promise<Attendance> =>
    (await apiClient.put<Attendance>(`${BASE}/${id}`, payload)).data,
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
