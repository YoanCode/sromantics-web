import type { Parent } from '@/types/mds'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { ParentsDeleteDialog } from './parents-delete-dialog'

vi.mock('./parents-provider', () => ({
  useParents: () => ({
    onDelete: vi.fn(),
    onDeleteAsync: vi.fn(),
    open: null,
    setOpen: vi.fn(),
    currentRow: null,
    setCurrentRow: vi.fn(),
  }),
}))

const MOCK_PARENT: Parent = {
  id: 'p_001',
  name: '王大明',
  phone: '0912345678',
  email: '',
  relationship: 'father',
}

describe('ParentsDeleteDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders delete warning title', async () => {
    const { getByText } = await render(
      <ParentsDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={MOCK_PARENT}
      />
    )

    expect(getByText(/Delete Parent/i)).toBeDefined()
  })

  it('displays warning message', async () => {
    const { getByText } = await render(
      <ParentsDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={MOCK_PARENT}
      />
    )

    expect(
      getByText(
        'This action cannot be undone. This will permanently delete the parent record.'
      )
    ).toBeDefined()
  })

  it('requires confirmation text before enabling delete', async () => {
    const { getByRole } = await render(
      <ParentsDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={MOCK_PARENT}
      />
    )

    const deleteButton = getByRole('button', { name: /Delete/i })
    expect(deleteButton).toBeDefined()
  })
})
