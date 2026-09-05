import type { Class } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useClassMutations, useClassesQuery } from './queries'

const fields = [
  { key: 'courseId', label: 'Course ID' },
  { key: 'className', label: 'Class Name' },
  { key: 'teacherName', label: 'Teacher' },
  { key: 'classroom', label: 'Classroom' },
  { key: 'dayOfWeek', label: 'Day', type: 'number' },
  { key: 'startTime', label: 'Start Time' },
  { key: 'endTime', label: 'End Time' },
  { key: 'maxCapacity', label: 'Capacity', type: 'number' },
  { key: 'pricePerPeriod', label: 'Price', type: 'number' },
] as const

export function Classes() {
  const { data = [], isLoading } = useClassesQuery()
  const mutations = useClassMutations()

  return (
    <CrudResourcePage
      title='Classes'
      description='Manage scheduled class sections and their fixed time slots.'
      resourceLabel='Class'
      fields={fields as { key: string; label: string; type?: 'number' }[]}
      rows={data as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading}
      onCreate={(payload) => mutations.create.mutateAsync(payload as Omit<Class, 'id'>)}
      onUpdate={(id, payload) =>
        mutations.update.mutateAsync({ id, data: payload as Class })
      }
      onDelete={(id) => mutations.remove.mutateAsync(id)}
    />
  )
}
