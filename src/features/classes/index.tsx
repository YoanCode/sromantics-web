import type { Class } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useClassMutations, useClassesQuery } from './queries'
import { useCoursesQuery } from '@/features/courses/queries'

const fields = [
  { key: 'courseId', label: 'Course', options: [], showInTable: false },
  { key: 'courseName', label: 'Course Name', readOnly: true },
  { key: 'className', label: 'Class Name' },
  { key: 'teacherName', label: 'Teacher' },
  { key: 'classroom', label: 'Classroom' },
  { key: 'dayOfWeek', label: 'Day', type: 'number', options: [{ value: '1', label: 'Monday' }, { value: '2', label: 'Tuesday' }, { value: '3', label: 'Wednesday' }, { value: '4', label: 'Thursday' }, { value: '5', label: 'Friday' }, { value: '6', label: 'Saturday' }, { value: '7', label: 'Sunday' }] },
  { key: 'startTime', label: 'Start Time' },
  { key: 'endTime', label: 'End Time' },
  { key: 'maxCapacity', label: 'Capacity', type: 'number' },
  { key: 'pricePerPeriod', label: 'Price', type: 'number' },
] as const

export function Classes() {
  const { data = [], isLoading } = useClassesQuery()
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery()
  const mutations = useClassMutations()
  const courseOptions = courses.map((course) => ({ value: course.id, label: course.name }))
  const rows = data.map((classItem) => ({
    ...classItem,
    courseName: courses.find((course) => course.id === classItem.courseId)?.name ?? 'Unknown course',
  }))

  return (
    <CrudResourcePage
      title='Classes'
      description='Manage scheduled class sections and their fixed time slots.'
      resourceLabel='Class'
      showId={false}
      fields={fields.map((field) => field.key === 'courseId' ? { ...field, options: courseOptions } : field) as { key: string; label: string; type?: 'number'; options?: { value: string; label: string }[]; readOnly?: boolean; showInTable?: boolean }[]}
      rows={rows as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading || coursesLoading}
      onCreate={(payload) => mutations.create.mutateAsync(payload as Omit<Class, 'id'>)}
      onUpdate={(id, payload) =>
        mutations.update.mutateAsync({ id, data: payload as Class })
      }
      onDelete={(id) => mutations.remove.mutateAsync(id)}
    />
  )
}
