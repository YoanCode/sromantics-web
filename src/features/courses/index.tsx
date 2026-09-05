import type { Course } from '@/types/mds'
import { CrudResourcePage } from '@/components/crud-resource-page'
import { useCoursesQuery, useCourseMutations } from './queries'

const fields = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
] as const

export function Courses() {
  const { data = [], isLoading } = useCoursesQuery()
  const mutations = useCourseMutations()

  return (
    <CrudResourcePage
      title='Courses'
      description='Manage reusable course information.'
      resourceLabel='Course'
      fields={fields as { key: string; label: string }[]}
      rows={data as unknown as (Record<string, unknown> & { id: string })[]}
      isLoading={isLoading}
      onCreate={(payload) => mutations.create.mutateAsync(payload as Omit<Course, 'id'>)}
      onUpdate={(id, payload) => mutations.update.mutateAsync({ id, data: payload as Course })}
      onDelete={(id) => mutations.remove.mutateAsync(id)}
    />
  )
}
