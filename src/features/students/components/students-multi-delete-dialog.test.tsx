import type { Table } from '@tanstack/react-table'
import type { Student } from '@/types/mds'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { StudentsMultiDeleteDialog } from './students-multi-delete-dialog'

vi.mock('sonner', () => ({
  toast: { promise: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/utils', () => ({
  sleep: vi.fn().then((resolve) => setTimeout(resolve, 100)),
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
    const { getByRole, getByPlaceholderText } = await render(
      <StudentsMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        table={mockTable as Table<Student>}
      />
    )

    const deleteButton = getByRole('button', { name: /Delete/i })
    expect(deleteButton.getAttribute('disabled')).not.toBeNull()

    const input = getByPlaceholderText(
      /Type "DELETE" to confirm/i
    ) as HTMLInputElement
    await userEvent.fill(input, 'DELETE')

    expect(deleteButton.getAttribute('disabled')).toBeNull()
  })

  it('shows error toast if confirmation text is incorrect', async () => {
    const { getByRole, getByPlaceholderText } = await render(
      <StudentsMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        table={mockTable as Table<Student>}
      />
    )

    const input = getByPlaceholderText(
      /Type "DELETE" to confirm/i
    ) as HTMLInputElement
    await userEvent.fill(input, 'WRONG')

    const deleteButton = getByRole('button', { name: /Delete/i })
    await userEvent.click(deleteButton)

    expect(toast.error).toHaveBeenCalled()
  })
})
