import type { StudentCourse } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useClassesQuery } from '@/features/classes/queries'
import { useEnrollmentsQuery } from '@/features/enrollments/queries'
import { useStudentCourseMutations, useStudentCoursesQuery } from './queries'
import { useStudentsQuery } from '@/features/students/queries'
import { useCoursesQuery } from '@/features/courses/queries'

const fields = [
  { key: 'studentId', label: 'Student', options: [], showInTable: false },
  { key: 'studentName', label: 'Student Name', readOnly: true },
  { key: 'courseId', label: 'Course', options: [], showInTable: false },
  { key: 'courseName', label: 'Course Name', readOnly: true },
  { key: 'enrolledAt', label: 'Enrolled At', type: 'date', defaultValue: new Date().toISOString().slice(0, 10) },
  { key: 'className', label: 'Class Name', readOnly: true },
  { key: 'purchasedLessons', label: 'Purchased', type: 'number' },
  { key: 'usedLessons', label: 'Used', type: 'number', disabled: true, defaultValue: 0 },
  { key: 'remainingLessons', label: 'Remaining', type: 'number', disabled: true, defaultValue: 0 },
  { key: 'paymentStatus', label: 'Payment', options: [{ value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Partial' }] },
  { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] },
] as const

export function StudentCourses() {
  const { data = [], isLoading } = useStudentCoursesQuery()
  const { data: classes = [], isLoading: classesLoading } = useClassesQuery()
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollmentsQuery()
  const { data: students = [], isLoading: studentsLoading } = useStudentsQuery()
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery()
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
    return {
      ...studentCourse,
      studentName: students.find((student) => student.id === studentCourse.studentId)?.name ?? 'Unknown student',
      courseName: courses.find((course) => course.id === studentCourse.courseId)?.name ?? 'Unknown course',
      className: className ?? 'No active class',
    }
  })

  return (
    <CrudResourcePage
      title='Student Courses'
      description='Manage course balances that remain available across class transfers.'
      resourceLabel='Student Course'
      showId={false}
      fields={fields.map((field) => field.key === 'studentId' ? { ...field, options: students.map((student) => ({ value: student.id, label: student.name })) } : field.key === 'courseId' ? { ...field, options: courses.map((course) => ({ value: course.id, label: course.name })) } : field) as { key: string; label: string; type?: 'number'; options?: { value: string; label: string }[]; readOnly?: boolean; disabled?: boolean; defaultValue?: number }[]}
      rows={rows as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading || classesLoading || enrollmentsLoading || studentsLoading || coursesLoading}
      onCreate={(payload) => mutations.create.mutateAsync({
        ...payload,
        usedLessons: 0,
        remainingLessons: Number(payload.purchasedLessons ?? 0),
      } as Omit<StudentCourse, 'id'>)}
      onUpdate={(id, payload) =>
        mutations.update.mutateAsync({ id, data: payload as StudentCourse })
      }
      onDelete={(id) => mutations.remove.mutateAsync(id)}
    />
  )
}
