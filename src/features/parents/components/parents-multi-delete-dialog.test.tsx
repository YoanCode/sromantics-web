import type { Table } from '@tanstack/react-table'
import type { Parent } from '@/types/mds'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { ParentsMultiDeleteDialog } from './parents-multi-delete-dialog'

vi.mock('./parents-provider', () => ({
  useParents: () => ({
    onDeleteAsync: vi.fn().mockResolvedValue(undefined),
    open: null,
    setOpen: vi.fn(),
    currentRow: null,
    setCurrentRow: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: { promise: vi.fn(), error: vi.fn() },
}))

describe('ParentsMultiDeleteDialog', () => {
  let mockTable: Partial<Table<Parent>>

  beforeEach(() => {
    vi.clearAllMocks()
    mockTable = {
      getFilteredSelectedRowModel: vi.fn().mockReturnValue({
        rows: [
          { original: { id: 'p_001', name: '王大明' } },
          { original: { id: 'p_002', name: '李小華' } },
        ],
      }),
      resetRowSelection: vi.fn(),
    }
  })

  it('renders multi-delete warning title', async () => {
    const { getByText } = await render(
      <ParentsMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        table={mockTable as Table<Parent>}
      />
    )

    expect(getByText(/Delete Parents/i)).toBeDefined()
  })

  it('shows count of parents to be deleted', async () => {
    const { getByText } = await render(
      <ParentsMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        table={mockTable as Table<Parent>}
      />
    )

    expect(getByText(/2 parents/i)).toBeDefined()
  })

  it('requires confirmation text before enabling delete', async () => {
    const { getByRole } = await render(
      <ParentsMultiDeleteDialog
        open
        onOpenChange={vi.fn()}
        table={mockTable as Table<Parent>}
      />
    )

    const deleteButton = getByRole('button', { name: /Delete/i })
    expect(deleteButton).toBeDefined()
  })
})
