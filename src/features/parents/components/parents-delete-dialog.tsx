'use client'

import { useState } from 'react'
import type { Parent } from '@/types/mds'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useParents } from './parents-provider'

type ParentsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Parent
}

export function ParentsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ParentsDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { onDelete } = useParents()

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return
    onDelete(currentRow.id)
    onOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='parents-delete-form'
      disabled={value.trim() !== currentRow.name}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Parent
        </span>
      }
      desc={
        <form
          id='parents-delete-form'
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
              parent record.
            </AlertDescription>
          </Alert>
          <p className='text-sm'>
            To confirm, type{' '}
            <span className='font-bold text-destructive'>
              {currentRow.name}
            </span>
          </p>
          <Input
            placeholder='Enter parent name'
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </form>
      }
    />
  )
}
