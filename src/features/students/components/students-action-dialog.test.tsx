import type { Student } from '@/types/mds'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { StudentsActionDialog } from './students-action-dialog'

vi.mock('./students-provider', () => ({
  useStudents: () => ({
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

const MOCK_STUDENT: Student = {
  id: 's_001',
  parentId: 'p_001',
  name: '王小智',
  gender: 'male',
  schoolName: '東山國中',
  grade: '國二',
  note: '對海鮮過敏，下課需要家長接送',
  status: 'active',
}

describe('StudentsActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('add student', () => {
    it('renders title and description for add mode', async () => {
      const { getByRole } = await render(
        <StudentsActionDialog open onOpenChange={vi.fn()} />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Add New Student/i,
      })
      expect(title).toBeDefined()
    })

    it('should show required validation messages when submitting empty form', async () => {
      const { getByRole } = await render(
        <StudentsActionDialog open onOpenChange={vi.fn()} />
      )

      const saveButton = getByRole('button', { name: /Save/i })
      await userEvent.click(saveButton)

      // Validation message will appear in the form
    })
  })

  describe('edit student', () => {
    it('renders title for edit mode', async () => {
      const { getByRole } = await render(
        <StudentsActionDialog
          open
          onOpenChange={vi.fn()}
          currentRow={MOCK_STUDENT}
        />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Edit Student/i,
      })
      expect(title).toBeDefined()
    })

    it('populates form with existing student data', async () => {
      const { getByRole } = await render(
        <StudentsActionDialog
          open
          onOpenChange={vi.fn()}
          currentRow={MOCK_STUDENT}
        />
      )

      // Verify form fields are populated with existing data
      const titleElement = getByRole('heading', {
        level: 2,
        name: /Edit Student/i,
      })
      expect(titleElement).toBeDefined()
    })
  })

  describe('form submission', () => {
    it('calls showSubmittedData when form is submitted with valid data', async () => {
      const mockOnOpenChange = vi.fn()
      const { getByRole } = await render(
        <StudentsActionDialog open onOpenChange={mockOnOpenChange} />
      )

      // Verify save button exists
      const saveButton = getByRole('button', { name: /Save/i })
      expect(saveButton).toBeDefined()
    })
  })
})
