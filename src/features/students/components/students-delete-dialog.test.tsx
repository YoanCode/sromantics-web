import type { Student } from '@/types/mds'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { StudentsDeleteDialog } from './students-delete-dialog'

const MOCK_STUDENT: Student = {
  id: 's_001',
  parentId: 'p_001',
  name: '王小智',
  gender: 'male',
  schoolName: '東山國中',
  grade: '國二',
  note: '',
  status: 'active',
}

vi.mock('@/lib/show-submitted-data', () => ({ showSubmittedData: vi.fn() }))

describe('StudentsDeleteDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders delete warning title', async () => {
    const { getByText } = await render(
      <StudentsDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={MOCK_STUDENT}
      />
    )

    expect(getByText(/Delete Student/i)).toBeDefined()
  })

  it('displays warning message', async () => {
    const { getByText } = await render(
      <StudentsDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={MOCK_STUDENT}
      />
    )

    expect(
      getByText(
        'This action cannot be undone. This will permanently delete the student record.'
      )
    ).toBeDefined()
  })

  it('requires confirmation text before enabling delete', async () => {
    const { getByRole, getByPlaceholderText } = await render(
      <StudentsDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={MOCK_STUDENT}
      />
    )

    const deleteButton = getByRole('button', { name: /Delete/i })
    expect(deleteButton.getAttribute('disabled')).not.toBeNull()

    const input = getByPlaceholderText('Enter student name') as HTMLInputElement
    await userEvent.fill(input, MOCK_STUDENT.name)

    expect(deleteButton.getAttribute('disabled')).toBeNull()
  })

  it('calls showSubmittedData when deletion is confirmed', async () => {
    const mockOnOpenChange = vi.fn()
    const { getByRole, getByPlaceholderText } = await render(
      <StudentsDeleteDialog
        open
        onOpenChange={mockOnOpenChange}
        currentRow={MOCK_STUDENT}
      />
    )

    const input = getByPlaceholderText('Enter student name') as HTMLInputElement
    await userEvent.fill(input, MOCK_STUDENT.name)

    const deleteButton = getByRole('button', { name: /Delete/i })
    await userEvent.click(deleteButton)

    expect(showSubmittedData).toHaveBeenCalledWith(
      MOCK_STUDENT,
      'The following student has been deleted:'
    )
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
