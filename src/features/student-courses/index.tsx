import type { StudentCourse } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useClassesQuery } from '@/features/classes/queries'
import { useEnrollmentsQuery } from '@/features/enrollments/queries'
import { useStudentCourseMutations, useStudentCoursesQuery } from './queries'

const fields = [
  { key: 'studentId', label: 'Student ID' },
  { key: 'courseId', label: 'Course ID' },
  { key: 'className', label: 'Class Name', readOnly: true },
  { key: 'purchasedLessons', label: 'Purchased', type: 'number' },
  { key: 'usedLessons', label: 'Used', type: 'number' },
  { key: 'remainingLessons', label: 'Remaining', type: 'number' },
  { key: 'paymentStatus', label: 'Payment' },
  { key: 'status', label: 'Status' },
] as const

export function StudentCourses() {
  const { data = [], isLoading } = useStudentCoursesQuery()
  const { data: classes = [], isLoading: classesLoading } = useClassesQuery()
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollmentsQuery()
  const mutations = useStudentCourseMutations()
  const rows = data.map((studentCourse) => {
    const activeEnrollment = enrollments.find(
      (enrollment) =>
        enrollment.studentCourseId === studentCourse.id &&
        enrollment.status === 'active'
    )
    const className = classes.find(
      (clazz) => clazz.id === activeEnrollment?.classId
    )?.className
    return { ...studentCourse, className: className ?? 'No active class' }
  })

  return (
    <CrudResourcePage
      title='Student Courses'
      description='Manage course balances that remain available across class transfers.'
      resourceLabel='Student Course'
      fields={fields as { key: string; label: string; type?: 'number'; readOnly?: boolean }[]}
      rows={rows as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading || classesLoading || enrollmentsLoading}
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
