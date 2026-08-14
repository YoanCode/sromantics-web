'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/confirm-dialog'

type StudentMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function StudentsMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: StudentMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: 'Deleting students...',
      success: () => {
        setValue('')
        table.resetRowSelection()
        return `Deleted ${selectedRows.length} ${selectedRows.length > 1 ? 'students' : 'student'}`
      },
      error: 'Error deleting students',
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='students-multi-delete-form'
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Students
        </span>
      }
      desc={
        <form
          id='students-multi-delete-form'
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
              You are about to delete {selectedRows.length} student
              {selectedRows.length > 1 ? 's' : ''}. This action cannot be
              undone.
            </AlertDescription>
          </Alert>
          <p className='text-sm'>
            To confirm, type{' '}
            <span className='font-bold text-destructive'>{CONFIRM_WORD}</span>
          </p>
          <Input
            placeholder={`Type "${CONFIRM_WORD}" to confirm`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </form>
      }
    />
  )
}
