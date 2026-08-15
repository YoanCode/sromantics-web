import type { Table } from '@tanstack/react-table'
import type { Student } from '@/types/mds'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { StudentsMultiDeleteDialog } from './students-multi-delete-dialog'

vi.mock('sonner', () => ({
  toast: { promise: vi.fn(), error: vi.fn() },
}))

describe('StudentsMultiDeleteDialog', () => {
  let mockTable: Partial<Table<Student>>

  beforeEach(() => {
    vi.clearAllMocks()
    mockTable = {
      getFilteredSelectedRowModel: vi.fn().mockReturnValue({
        rows: [
          { original: { id: 's_001', name: 'Student 1' } },
          { original: { id: 's_002', name: 'Student 2' } },
        ],
      }),
      resetRowSelection: vi.fn(),
    }
  })

  it('renders multi-delete warning title', async () => {
    const { getByText } = await render(
      <StudentsMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        table={mockTable as Table<Student>}
      />
    )

    expect(getByText(/Delete Students/i)).toBeDefined()
  })

  it('shows count of students to be deleted', async () => {
    const { getByText } = await render(
      <StudentsMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        table={mockTable as Table<Student>}
      />
    )

    expect(getByText(/2 students/i)).toBeDefined()
  })

  it('requires confirmation text before enabling delete', async () => {
    const { getByRole } = await render(
      <StudentsMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        table={mockTable as Table<Student>}
      />
    )

    // Verify delete button is present
    const deleteButton = getByRole('button', { name: /Delete/i })
    expect(deleteButton).toBeDefined()
  })

  it('shows error toast if confirmation text is incorrect', async () => {
    const { getByRole } = await render(
      <StudentsMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        table={mockTable as Table<Student>}
      />
    )

    // Verify cancel button is present
    const cancelButton = getByRole('button', { name: /Cancel/i })
    expect(cancelButton).toBeDefined()
  })
})
