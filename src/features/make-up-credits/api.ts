import type { MakeUpCredit } from '@/types/mds'
import apiClient from '@/lib/api-client'

const BASE = '/api/make-up-credits'

export const makeUpCreditsApi = {
  list: async (): Promise<MakeUpCredit[]> => (await apiClient.get<MakeUpCredit[]>(BASE)).data,
  update: async (id: string, payload: Pick<MakeUpCredit, 'targetClassId' | 'targetDate' | 'note'>) =>
    (await apiClient.put<MakeUpCredit>(`${BASE}/${id}`, payload)).data,
  cancel: async (id: string): Promise<void> => {
    await apiClient.post(`${BASE}/${id}/cancel`)
  },
}