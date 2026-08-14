'use client'

import { useState } from 'react'
import type { Student } from '@/types/mds'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/confirm-dialog'

type StudentDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Student
}

export function StudentsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: StudentDeleteDialogProps) {
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return

    onOpenChange(false)
    showSubmittedData(currentRow, 'The following student has been deleted:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='students-delete-form'
      disabled={value.trim() !== currentRow.name}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Student
        </span>
      }
      desc={
        <form
          id='students-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone. This will permanently delete the
              student record.
            </AlertDescription>
          </Alert>
          <p className='text-sm'>
            To confirm, type{' '}
            <span className='font-bold text-destructive'>
              {currentRow.name}
            </span>
          </p>
          <Input
            placeholder='Enter student name'
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </form>
      }
    />
  )
}
