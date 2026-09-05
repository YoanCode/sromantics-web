import type { Enrollment } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useEnrollmentMutations, useEnrollmentsQuery } from './queries'

const fields = [
  { key: 'studentCourseId', label: 'Student Course ID' },
  { key: 'classId', label: 'Class ID' },
  { key: 'startedAt', label: 'Started At' },
  { key: 'endedAt', label: 'Ended At' },
  { key: 'status', label: 'Status' },
] as const

export function Enrollments() {
  const { data = [], isLoading } = useEnrollmentsQuery()
  const mutations = useEnrollmentMutations()

  return (
    <CrudResourcePage
      title='Enrollments'
      description='Manage current class memberships and transfer history.'
      resourceLabel='Enrollment'
      fields={fields as { key: string; label: string }[]}
      rows={data as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading}
      onCreate={(payload) => mutations.create.mutateAsync(payload as Omit<Enrollment, 'id'>)}
      onUpdate={(id, payload) =>
        mutations.update.mutateAsync({ id, data: payload as Enrollment })
      }
      onDelete={(id) => mutations.remove.mutateAsync(id)}
    />
  )
}
