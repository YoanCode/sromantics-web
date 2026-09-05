import { createFileRoute } from '@tanstack/react-router'
import { StudentCourses } from '@/features/student-courses'

export const Route = createFileRoute('/_authenticated/student-courses/')({
  component: StudentCourses,
})
