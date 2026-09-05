import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { MakeUpCredit } from '@/types/mds'
import { makeUpCreditsApi } from './api'

export const MAKE_UP_CREDITS_KEY = ['make-up-credits'] as const

export function useMakeUpCreditsQuery() {
  return useQuery({ queryKey: MAKE_UP_CREDITS_KEY, queryFn: makeUpCreditsApi.list })
}

export function useMakeUpCreditMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: MAKE_UP_CREDITS_KEY })
    void queryClient.invalidateQueries({ queryKey: ['attendances'] })
  }
  return {
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Pick<MakeUpCredit, 'targetClassId' | 'targetDate' | 'note'> }) =>
        makeUpCreditsApi.update(id, data),
      onSuccess: () => { invalidate(); toast.success('Make-up class scheduled.') },
    }),
    cancel: useMutation({
      mutationFn: makeUpCreditsApi.cancel,
      onSuccess: () => { invalidate(); toast.success('Make-up credit cancelled.') },
    }),
  }
}