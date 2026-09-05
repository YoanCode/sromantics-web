import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { StudentCourse } from '@/types/mds'
import { studentCoursesApi } from './api'

const STUDENT_COURSES_KEY = ['student-courses'] as const

export function useStudentCoursesQuery() {
  return useQuery({ queryKey: STUDENT_COURSES_KEY, queryFn: studentCoursesApi.list })
}

export function useStudentCourseMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: STUDENT_COURSES_KEY })
  return {
    create: useMutation({
      mutationFn: studentCoursesApi.create,
      onSuccess: () => { void invalidate(); toast.success('Student course added.') },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: StudentCourse }) =>
        studentCoursesApi.update(id, data),
      onSuccess: () => { void invalidate(); toast.success('Student course updated.') },
    }),
    remove: useMutation({
      mutationFn: studentCoursesApi.delete,
      onSuccess: () => { void invalidate(); toast.success('Student course deleted.') },
    }),
  }
}
