import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Course } from '@/types/mds'
import { coursesApi } from './api'

const COURSES_KEY = ['courses'] as const

export function useCoursesQuery() {
  return useQuery({ queryKey: COURSES_KEY, queryFn: coursesApi.list })
}

export function useCourseMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: COURSES_KEY })
  return {
    create: useMutation({
      mutationFn: coursesApi.create,
      onSuccess: () => { void invalidate(); toast.success('Course added.') },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Course }) => coursesApi.update(id, data),
      onSuccess: () => { void invalidate(); toast.success('Course updated.') },
    }),
    remove: useMutation({
      mutationFn: coursesApi.delete,
      onSuccess: () => { void invalidate(); toast.success('Course deleted.') },
    }),
  }
}
