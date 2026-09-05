import type { Enrollment } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useClassesQuery } from '@/features/classes/queries'
import { useEnrollmentMutations, useEnrollmentsQuery } from './queries'
import { useStudentCoursesQuery } from '@/features/student-courses/queries'
import { useStudentsQuery } from '@/features/students/queries'
import { useCoursesQuery } from '@/features/courses/queries'

const fields = [
  { key: 'studentCourseId', label: 'Student Course', options: [], resetKeys: ['classId'], showInTable: false },
  { key: 'studentCourseName', label: 'Student Course', readOnly: true },
  { key: 'classId', label: 'Class', options: [], showInTable: false },
  { key: 'className', label: 'Class Name', readOnly: true },
  { key: 'startedAt', label: 'Started At', type: 'date' },
  { key: 'endedAt', label: 'Ended At', type: 'date' },
  { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'transferred', label: 'Transferred' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] },
] as const

export function Enrollments() {
  const { data = [], isLoading } = useEnrollmentsQuery()
  const { data: classes = [], isLoading: classesLoading } = useClassesQuery()
  const { data: studentCourses = [], isLoading: studentCoursesLoading } = useStudentCoursesQuery()
  const { data: students = [], isLoading: studentsLoading } = useStudentsQuery()
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery()
  const mutations = useEnrollmentMutations()
  const rows = data.map((enrollment) => ({
    ...enrollment,
    studentCourseName: (() => {
      const item = studentCourses.find((course) => course.id === enrollment.studentCourseId)
      const student = students.find((value) => value.id === item?.studentId)
      const course = courses.find((value) => value.id === item?.courseId)
      return item ? `${student?.name ?? 'Unknown student'} - ${course?.name ?? 'Unknown course'}` : 'Unknown student course'
    })(),
    className:
      classes.find((clazz) => clazz.id === enrollment.classId)?.className ??
      'Unknown class',
  }))

  const classOptions = (form: Record<string, unknown>) => [{ value: '', label: 'Select a class' }, ...classes
    .filter((item) => {
      const selected = studentCourses.find((course) => course.id === form.studentCourseId)
      return !selected || selected.courseId === item.courseId
    })]
    .map((item) => {
      const course = courses.find((value) => value.id === item.courseId)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return {
        value: item.id,
        label: `${course?.name ?? 'Unknown course'} - ${item.className} (${dayNames[item.dayOfWeek % 7]} ${item.startTime}-${item.endTime})`,
      }
    })

  return (
    <CrudResourcePage
      title='Enrollments'
      description='Manage current class memberships and transfer history.'
      resourceLabel='Enrollment'
      showId={false}
      fields={fields.map((field) => field.key === 'studentCourseId' ? { ...field, options: studentCourses.map((item) => ({ value: item.id, label: `${students.find((value) => value.id === item.studentId)?.name ?? 'Unknown student'} - ${courses.find((value) => value.id === item.courseId)?.name ?? 'Unknown course'}` })) } : field.key === 'classId' ? { ...field, options: classOptions } : field) as { key: string; label: string; type?: 'date'; options?: { value: string; label: string }[] | ((form: Record<string, unknown>) => { value: string; label: string }[]); readOnly?: boolean; showInTable?: boolean; resetKeys?: string[] }[]}
      rows={rows as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading || classesLoading || studentCoursesLoading || studentsLoading || coursesLoading}
      onCreate={(payload) => mutations.create.mutateAsync(payload as Omit<Enrollment, 'id'>)}
      onUpdate={(id, payload) =>
        mutations.update.mutateAsync({ id, data: payload as Enrollment })
      }
      onDelete={(id) => mutations.remove.mutateAsync(id)}
    />
  )
}
