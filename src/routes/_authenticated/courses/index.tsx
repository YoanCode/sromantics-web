import { createFileRoute } from '@tanstack/react-router'
import { Courses } from '@/features/courses'

export const Route = createFileRoute('/_authenticated/courses/')({
  component: Courses,
})
