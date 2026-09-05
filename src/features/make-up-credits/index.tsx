import { CrudResourcePage } from '@/components/crud-resource-page'
import { useClassesQuery } from '@/features/classes/queries'
import { useCoursesQuery } from '@/features/courses/queries'
import { useEnrollmentsQuery } from '@/features/enrollments/queries'
import { useStudentCoursesQuery } from '@/features/student-courses/queries'
import { useStudentsQuery } from '@/features/students/queries'
import { useAttendanceQuery } from '@/features/attendance/queries'
import { useMakeUpCreditMutations, useMakeUpCreditsQuery } from './queries'

const fields = [
  { key: 'studentName', label: 'Student', readOnly: true },
  { key: 'sourceCourseName', label: 'Original Course', readOnly: true },
  { key: 'sourceClassName', label: 'Original Class', readOnly: true },
  { key: 'sourceDate', label: 'Absence Date', type: 'date', readOnly: true },
  { key: 'sourceEnrollmentId', label: 'Source Enrollment', readOnly: true, showInTable: false },
  { key: 'validUntil', label: 'Valid Until', readOnly: true },
  { key: 'targetClassId', label: 'Make-up Class', options: [], showInTable: false },
  { key: 'targetClassName', label: 'Make-up Class', readOnly: true },
  { key: 'targetDate', label: 'Make-up Date', type: 'date' },
  { key: 'status', label: 'Status', readOnly: true },
  { key: 'note', label: 'Note' },
] as const

export function MakeUpCreditsPage() {
  const { data = [], isLoading } = useMakeUpCreditsQuery()
  const { data: attendances = [], isLoading: attendancesLoading } = useAttendanceQuery()
  const { data: classes = [], isLoading: classesLoading } = useClassesQuery()
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery()
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollmentsQuery()
  const { data: studentCourses = [], isLoading: studentCoursesLoading } = useStudentCoursesQuery()
  const { data: students = [], isLoading: studentsLoading } = useStudentsQuery()
  const mutations = useMakeUpCreditMutations()

  const rows = data.map((credit) => {
    const sourceAttendance = attendances.find((attendance) => attendance.id === credit.sourceAttendanceId)
    const sourceEnrollment = enrollments.find((enrollment) => enrollment.id === credit.sourceEnrollmentId)
    const sourceStudentCourse = studentCourses.find(
      (studentCourse) => studentCourse.id === sourceEnrollment?.studentCourseId
    )
    const sourceClass = classes.find((classItem) => classItem.id === sourceAttendance?.classId)
    return {
      ...credit,
      studentName: students.find((student) => student.id === credit.studentId)?.name ?? 'Unknown student',
      sourceCourseName: courses.find((course) => course.id === sourceStudentCourse?.courseId)?.name ?? 'Unknown course',
      sourceClassName: sourceClass?.className ?? 'Unknown class',
      sourceDate: sourceAttendance?.attendanceDate ?? 'Unknown date',
      targetClassId: credit.targetClassId ?? '',
      targetClassName: classes.find((classItem) => classItem.id === credit.targetClassId)?.className ?? 'Not scheduled',
    }
  })

  return (
    <CrudResourcePage
      title='Make-up Credits'
      description='Schedule one replacement class for an absence before the credit expires.'
      resourceLabel='Make-up Credit'
      showId={false}
      canCreate={false}
      deleteLabel='Cancel'
      fields={fields.map((field) => field.key === 'targetClassId' ? {
        ...field,
        options: (form: Record<string, unknown>) => {
          const rowCredit = data.find((credit) => credit.sourceEnrollmentId === form.sourceEnrollmentId)
          const sourceEnrollment = rowCredit
            ? enrollments.find((enrollment) => enrollment.id === rowCredit.sourceEnrollmentId)
            : undefined
          const sourceStudentCourse = sourceEnrollment
            ? studentCourses.find((studentCourse) => studentCourse.id === sourceEnrollment.studentCourseId)
            : undefined
          const sourceCourseId = sourceStudentCourse?.courseId
          return classes
            .filter((classItem) => !sourceCourseId || classItem.courseId === sourceCourseId)
            .map((classItem) => ({
              value: classItem.id,
              label: `${classItem.className} (${classItem.startTime}-${classItem.endTime})`,
            }))
        },
      } : field) as { key: string; label: string; type?: 'date'; readOnly?: boolean; options?: { value: string; label: string }[] | ((form: Record<string, unknown>) => { value: string; label: string }[]); showInTable?: boolean }[]}
      rows={rows as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading || attendancesLoading || classesLoading || coursesLoading || enrollmentsLoading || studentCoursesLoading || studentsLoading}
      onCreate={async () => undefined}
      onUpdate={(id, payload) => mutations.update.mutateAsync({
        id,
        data: {
          targetClassId: String(payload.targetClassId ?? ''),
          targetDate: String(payload.targetDate ?? ''),
          note: String(payload.note ?? ''),
        },
      })}
      onDelete={(id) => mutations.cancel.mutateAsync(id)}
    />
  )
}