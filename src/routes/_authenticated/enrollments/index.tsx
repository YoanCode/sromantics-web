import { createFileRoute } from '@tanstack/react-router'
import { Enrollments } from '@/features/enrollments'

export const Route = createFileRoute('/_authenticated/enrollments/')({
  component: Enrollments,
})
