import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Enrollment } from '@/types/mds'
import { enrollmentsApi } from './api'

const ENROLLMENTS_KEY = ['enrollments'] as const

export function useEnrollmentsQuery() {
  return useQuery({ queryKey: ENROLLMENTS_KEY, queryFn: enrollmentsApi.list })
}

export function useEnrollmentMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY })
  return {
    create: useMutation({
      mutationFn: enrollmentsApi.create,
      onSuccess: () => { void invalidate(); toast.success('Enrollment added.') },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Enrollment }) =>
        enrollmentsApi.update(id, data),
      onSuccess: () => { void invalidate(); toast.success('Enrollment updated.') },
    }),
    remove: useMutation({
      mutationFn: enrollmentsApi.delete,
      onSuccess: () => { void invalidate(); toast.success('Enrollment deleted.') },
    }),
  }
}
