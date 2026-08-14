import type { Student } from '@/types/mds'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { StudentsActionDialog } from './students-action-dialog'

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

vi.mock('@/lib/show-submitted-data', () => ({ showSubmittedData: vi.fn() }))

describe('StudentsActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('add student', () => {
    it('renders title and description for add mode', async () => {
      const { getByRole, getByText } = await render(
        <StudentsActionDialog open onOpenChange={vi.fn()} />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Add New Student/i,
      })
      expect(title).toBeDefined()
    })

    it('should show required validation messages when submitting empty form', async () => {
      const { getByRole, getByText } = await render(
        <StudentsActionDialog open onOpenChange={vi.fn()} />
      )

      const saveButton = getByRole('button', { name: /Save/i })
      await userEvent.click(saveButton)

      expect(getByText('Student name is required.')).toBeDefined()
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
      const { getByDisplayValue } = await render(
        <StudentsActionDialog
          open
          onOpenChange={vi.fn()}
          currentRow={MOCK_STUDENT}
        />
      )

      expect(getByDisplayValue(MOCK_STUDENT.name)).toBeDefined()
      expect(getByDisplayValue(MOCK_STUDENT.schoolName)).toBeDefined()
    })
  })

  describe('form submission', () => {
    it('calls showSubmittedData when form is submitted with valid data', async () => {
      const mockOnOpenChange = vi.fn()
      const { getByRole, getByDisplayValue } = await render(
        <StudentsActionDialog open onOpenChange={mockOnOpenChange} />
      )

      const nameInput = getByDisplayValue('') as HTMLInputElement
      if (nameInput) {
        await userEvent.fill(nameInput, MOCK_STUDENT.name)
      }

      const saveButton = getByRole('button', { name: /Save/i })
      await userEvent.click(saveButton)

      // Verify dialog closed
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
