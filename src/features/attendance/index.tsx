import type { Attendance } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useClassesQuery } from '@/features/classes/queries'
import { useCoursesQuery } from '@/features/courses/queries'
import { useEnrollmentsQuery } from '@/features/enrollments/queries'
import { useStudentCoursesQuery } from '@/features/student-courses/queries'
import { useStudentsQuery } from '@/features/students/queries'
import { useAttendanceMutations, useAttendanceQuery } from './queries'
import { useMakeUpCreditsQuery } from '@/features/make-up-credits/queries'

const fields = [
  { key: 'enrollmentId', label: 'Enrollment', options: [], showInTable: false },
  { key: 'makeUpCreditId', label: 'Make-up Credit', options: [], showInTable: false },
  { key: 'enrollmentName', label: 'Enrollment', readOnly: true },
  { key: 'studentName', label: 'Student', readOnly: true },
  { key: 'className', label: 'Class', readOnly: true },
  { key: 'attendanceDate', label: 'Date', type: 'date' },
  { key: 'status', label: 'Status', options: [{ value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }, { value: 'late', label: 'Late' }, { value: 'excused', label: 'Excused' }] },
  { key: 'note', label: 'Note' },
] as const

export function AttendancePage() {
  const { data = [], isLoading } = useAttendanceQuery()
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollmentsQuery()
  const { data: studentCourses = [], isLoading: studentCoursesLoading } = useStudentCoursesQuery()
  const { data: students = [], isLoading: studentsLoading } = useStudentsQuery()
  const { data: classes = [], isLoading: classesLoading } = useClassesQuery()
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery()
  const { data: makeUpCredits = [], isLoading: makeUpCreditsLoading } = useMakeUpCreditsQuery()
  const mutations = useAttendanceMutations()

  const courseNameById = new Map(courses.map((course) => [course.id, course.name]))

  const isScheduledClassDate = (classItem: (typeof classes)[number], dateValue: string) => {
    const [year, month, day] = dateValue.split('-').map(Number)
    if (!year || !month || !day) return false
    const sundayBasedDay = new Date(year, month - 1, day).getDay()
    const mondayBasedDay = sundayBasedDay === 0 ? 7 : sundayBasedDay
    return classItem.dayOfWeek === mondayBasedDay
  }

  const rows = data.map((attendance) => {
    const enrollment = enrollments.find((item) => item.id === attendance.enrollmentId)
    const studentCourseId = enrollment?.studentCourseId ?? attendance.studentCourseId
    const studentCourse = studentCourses.find((item) => item.id === studentCourseId)
    const studentName = students.find((student) => student.id === studentCourse?.studentId)?.name
    const className = classes.find((clazz) => clazz.id === attendance.classId)?.className
    return {
      ...attendance,
      studentName: studentName ?? 'Unknown student',
      className: className ?? 'Unknown class',
      enrollmentName: `${studentName ?? 'Unknown student'} - ${className ?? 'Unknown class'}`,
    }
  })

  return (
    <CrudResourcePage
      title='Attendance'
      description='Record and review daily attendance for enrolled students.'
      resourceLabel='Attendance'
      showId={false}
      fields={fields.map((field) => field.key === 'makeUpCreditId' ? {
        ...field,
        options: (form: Record<string, unknown>) => {
          const enrollment = enrollments.find((item) => item.id === form.enrollmentId)
          const attendanceDate = String(form.attendanceDate ?? '')
          return [
            { value: '', label: 'Regular attendance' },
            ...makeUpCredits
              .filter((credit) =>
                credit.status === 'scheduled' &&
                credit.targetDate === attendanceDate &&
                enrollment?.id === credit.sourceEnrollmentId
              )
              .map((credit) => ({
                value: credit.id,
                label: `Make-up credit (${credit.targetDate})`,
              })),
          ]
        },
      } : field.key === 'enrollmentId' ? {
        ...field,
        options: (form: Record<string, unknown>) => {
          const attendanceDate = String(form.attendanceDate ?? '')
          return [{ value: '', label: 'Select an enrollment' }, ...enrollments
            .filter((item) => {
              if (item.status === 'cancelled') return false
              if (!attendanceDate) return true
              const scheduledMakeUp = makeUpCredits.some((credit) =>
                credit.status === 'scheduled' &&
                credit.sourceEnrollmentId === item.id &&
                credit.targetDate === attendanceDate
              )
              if (scheduledMakeUp) return true
              const classItem = classes.find((clazz) => clazz.id === item.classId)
              return Boolean(
                classItem &&
                item.startedAt <= attendanceDate &&
                (!item.endedAt || item.endedAt >= attendanceDate) &&
                isScheduledClassDate(classItem, attendanceDate)
              )
            })]
            .map((item) => {
              const studentCourse = studentCourses.find((course) => course.id === item.studentCourseId)
              const studentName = students.find((student) => student.id === studentCourse?.studentId)?.name ?? 'Unknown student'
              const classItem = classes.find((clazz) => clazz.id === item.classId)
              const courseName = classItem ? courseNameById.get(classItem.courseId) ?? 'Unknown course' : 'Unknown course'
              const classLabel = classItem
                ? `${classItem.className} (${classItem.startTime}-${classItem.endTime})`
                : 'Unknown class'
              const scheduledMakeUp = makeUpCredits.find((credit) =>
                credit.status === 'scheduled' &&
                credit.sourceEnrollmentId === item.id &&
                credit.targetDate === attendanceDate
              )
              const targetClass = scheduledMakeUp
                ? classes.find((clazz) => clazz.id === scheduledMakeUp.targetClassId)
                : undefined
              const label = targetClass
                ? `${studentName} - ${courseName} - Make-up: ${targetClass.className} (${targetClass.startTime}-${targetClass.endTime}) - Original: ${classLabel}`
                : `${studentName} - ${courseName} - ${classLabel}`
              return {
                value: item.id,
                label,
              }
            })
        },
      } : field) as { key: string; label: string; type?: 'date'; readOnly?: boolean; resetKeys?: string[]; options?: { value: string; label: string }[] | ((form: Record<string, unknown>) => { value: string; label: string }[]); showInTable?: boolean }[]}
      rows={rows as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading || enrollmentsLoading || studentCoursesLoading || studentsLoading || classesLoading || coursesLoading || makeUpCreditsLoading}
      onCreate={(payload) => mutations.create.mutateAsync(payload as Omit<Attendance, 'id' | 'studentCourseId' | 'classId' | 'recordedAt'>)}
      onUpdate={(id, payload) => mutations.update.mutateAsync({ id, data: payload as Attendance })}
      onDelete={(id) => mutations.remove.mutateAsync(id)}
    />
  )
}
