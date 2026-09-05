import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Class } from '@/types/mds'
import { classesApi } from './api'

const CLASSES_KEY = ['classes'] as const

export function useClassesQuery() {
  return useQuery({ queryKey: CLASSES_KEY, queryFn: classesApi.list })
}

export function useClassMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: CLASSES_KEY })
  return {
    create: useMutation({
      mutationFn: classesApi.create,
      onSuccess: () => { void invalidate(); toast.success('Class added.') },
      onError: () => toast.error('Failed to add class.'),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Class }) => classesApi.update(id, data),
      onSuccess: () => { void invalidate(); toast.success('Class updated.') },
      onError: () => toast.error('Failed to update class.'),
    }),
    remove: useMutation({
      mutationFn: classesApi.delete,
      onSuccess: () => { void invalidate(); toast.success('Class deleted.') },
      onError: () => toast.error('Failed to delete class.'),
    }),
  }
}
