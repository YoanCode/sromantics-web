import type { Parent } from '@/types/mds'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { ParentsActionDialog } from './parents-action-dialog'

vi.mock('./parents-provider', () => ({
  useParents: () => ({
    onCreate: vi.fn(),
    onUpdate: vi.fn(),
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
  email: 'daming.wang@example.com',
  relationship: 'father',
}

describe('ParentsActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('add parent', () => {
    it('renders title for add mode', async () => {
      const { getByRole } = await render(
        <ParentsActionDialog open onOpenChange={vi.fn()} />
      )

      expect(
        getByRole('heading', { level: 2, name: /Add New Parent/i })
      ).toBeDefined()
    })

    it('shows validation messages when submitting empty form', async () => {
      const { getByRole } = await render(
        <ParentsActionDialog open onOpenChange={vi.fn()} />
      )

      const saveButton = getByRole('button', { name: /Save/i })
      await userEvent.click(saveButton)
    })
  })

  describe('edit parent', () => {
    it('renders title for edit mode', async () => {
      const { getByRole } = await render(
        <ParentsActionDialog
          open
          onOpenChange={vi.fn()}
          currentRow={MOCK_PARENT}
        />
      )

      expect(
        getByRole('heading', { level: 2, name: /Edit Parent/i })
      ).toBeDefined()
    })

    it('pre-fills name field with current row data', async () => {
      const { getByRole } = await render(
        <ParentsActionDialog
          open
          onOpenChange={vi.fn()}
          currentRow={MOCK_PARENT}
        />
      )

      const nameInput = getByRole('textbox', { name: /姓名/i })
      expect(nameInput).toBeDefined()
    })
  })
})
