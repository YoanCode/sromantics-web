'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { Parent } from '@/types/mds'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useParents } from './parents-provider'

type ParentsMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function ParentsMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: ParentsMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const { onDeleteAsync } = useParents()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }
    const ids = selectedRows.map((r) => (r.original as Parent).id)
    await Promise.all(ids.map((id) => onDeleteAsync(id)))
    setValue('')
    table.resetRowSelection()
    onOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='parents-multi-delete-form'
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Parents
        </span>
      }
      desc={
        <form
          id='parents-multi-delete-form'
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
              This will permanently delete{' '}
              <strong>{selectedRows.length} parents</strong>. This action
              cannot be undone.
            </AlertDescription>
          </Alert>
          <p className='text-sm'>
            Type <span className='font-bold text-destructive'>{CONFIRM_WORD}</span>{' '}
            to confirm.
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
