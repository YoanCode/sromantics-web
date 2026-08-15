import type { Student } from '@/types/mds'
import apiClient from '@/lib/api-client'

const BASE = '/api/students'

export const studentsApi = {
  list: async (): Promise<Student[]> => {
    const { data } = await apiClient.get<Student[]>(BASE)
    return data
  },

  create: async (payload: Omit<Student, 'id'>): Promise<Student> => {
    const { data } = await apiClient.post<Student>(BASE, payload)
    return data
  },

  update: async (id: string, payload: Student): Promise<Student> => {
    const { data } = await apiClient.put<Student>(`${BASE}/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
