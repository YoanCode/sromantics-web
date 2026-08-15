import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Student } from '@/types/mds'
import { studentsApi } from './api'

export const STUDENTS_KEY = ['students'] as const

export function useStudentsQuery() {
  return useQuery({
    queryKey: STUDENTS_KEY,
    queryFn: studentsApi.list,
  })
}

export function useCreateStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      toast.success('Student added successfully.')
    },
    onError: () => toast.error('Failed to add student.'),
  })
}

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Student }) =>
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      toast.success('Student updated successfully.')
    },
    onError: () => toast.error('Failed to update student.'),
  })
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      toast.success('Student deleted.')
    },
    onError: () => toast.error('Failed to delete student.'),
  })
}
