import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Attendance } from '@/types/mds'
import { attendanceApi } from './api'

const ATTENDANCE_KEY = ['attendances'] as const

export function useAttendanceQuery() {
  return useQuery({ queryKey: ATTENDANCE_KEY, queryFn: attendanceApi.list })
}

export function useAttendanceMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY })
  return {
    create: useMutation({
      mutationFn: attendanceApi.create,
      onSuccess: () => { void invalidate(); toast.success('Attendance recorded.') },
      onError: () => toast.error('Failed to record attendance.'),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Attendance }) => attendanceApi.update(id, data),
      onSuccess: () => { void invalidate(); toast.success('Attendance updated.') },
      onError: () => toast.error('Failed to update attendance.'),
    }),
    remove: useMutation({
      mutationFn: attendanceApi.delete,
      onSuccess: () => { void invalidate(); toast.success('Attendance deleted.') },
      onError: () => toast.error('Failed to delete attendance.'),
    }),
  }
}
