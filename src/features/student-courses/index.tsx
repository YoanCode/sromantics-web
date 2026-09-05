import type { StudentCourse } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useStudentCourseMutations, useStudentCoursesQuery } from './queries'

const fields = [
  { key: 'studentId', label: 'Student ID' },
  { key: 'courseId', label: 'Course ID' },
  { key: 'purchasedLessons', label: 'Purchased', type: 'number' },
  { key: 'usedLessons', label: 'Used', type: 'number' },
  { key: 'remainingLessons', label: 'Remaining', type: 'number' },
  { key: 'paymentStatus', label: 'Payment' },
  { key: 'status', label: 'Status' },
] as const

export function StudentCourses() {
  const { data = [], isLoading } = useStudentCoursesQuery()
  const mutations = useStudentCourseMutations()

  return (
    <CrudResourcePage
      title='Student Courses'
      description='Manage course balances that remain available across class transfers.'
      resourceLabel='Student Course'
      fields={fields as { key: string; label: string; type?: 'number' }[]}
      rows={data as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading}
      onCreate={(payload) =>
        mutations.create.mutateAsync(payload as Omit<StudentCourse, 'id'>)
      }
      onUpdate={(id, payload) =>
        mutations.update.mutateAsync({ id, data: payload as StudentCourse })
      }
      onDelete={(id) => mutations.remove.mutateAsync(id)}
    />
  )
}
