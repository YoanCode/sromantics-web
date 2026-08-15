import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Parent } from '@/types/mds'
import { parentsApi } from './api'

export const PARENTS_KEY = ['parents'] as const

export function useParentsQuery() {
  return useQuery({
    queryKey: PARENTS_KEY,
    queryFn: parentsApi.list,
  })
}

export function useCreateParentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: parentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARENTS_KEY })
      toast.success('Parent added successfully.')
    },
    onError: () => toast.error('Failed to add parent.'),
  })
}

export function useUpdateParentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parent }) =>
      parentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARENTS_KEY })
      toast.success('Parent updated successfully.')
    },
    onError: () => toast.error('Failed to update parent.'),
  })
}

export function useDeleteParentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: parentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARENTS_KEY })
      toast.success('Parent deleted.')
    },
    onError: () => toast.error('Failed to delete parent.'),
  })
}
