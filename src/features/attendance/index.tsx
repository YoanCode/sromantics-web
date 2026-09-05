import type { Attendance } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useClassesQuery } from '@/features/classes/queries'
import { useEnrollmentsQuery } from '@/features/enrollments/queries'
import { useStudentCoursesQuery } from '@/features/student-courses/queries'
import { useStudentsQuery } from '@/features/students/queries'
import { useAttendanceMutations, useAttendanceQuery } from './queries'

const fields = [
  { key: 'enrollmentId', label: 'Enrollment', options: [], showInTable: false },
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
  const mutations = useAttendanceMutations()

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
      fields={fields.map((field) => field.key === 'enrollmentId' ? { ...field, options: enrollments.map((item) => ({ value: item.id, label: `${rows.find((row) => row.id === item.id)?.enrollmentName ?? item.id}` })) } : field) as { key: string; label: string; type?: 'date'; readOnly?: boolean; options?: { value: string; label: string }[]; showInTable?: boolean }[]}
      rows={rows as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading || enrollmentsLoading || studentCoursesLoading || studentsLoading || classesLoading}
      onCreate={(payload) => mutations.create.mutateAsync(payload as Omit<Attendance, 'id' | 'studentCourseId' | 'classId' | 'recordedAt'>)}
      onUpdate={(id, payload) => mutations.update.mutateAsync({ id, data: payload as Attendance })}
      onDelete={(id) => mutations.remove.mutateAsync(id)}
    />
  )
}
