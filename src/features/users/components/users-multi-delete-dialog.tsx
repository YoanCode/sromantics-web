'use client'

import { useState } from 'react'
import type { Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/types/user'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUsers } from './users-provider'

type UsersMultiDeleteDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; table: Table<User> }
const CONFIRM_WORD = 'DELETE'

export function UsersMultiDeleteDialog({ open, onOpenChange, table }: UsersMultiDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { onDeleteAsync } = useUsers()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) { toast.error(`Please type "${CONFIRM_WORD}" to confirm.`); return }
    await Promise.all(selectedRows.map((row) => onDeleteAsync(row.original.id)))
    setValue('')
    table.resetRowSelection()
    onOpenChange(false)
  }
  return <ConfirmDialog open={open} onOpenChange={onOpenChange} form='users-multi-delete-form' disabled={value.trim() !== CONFIRM_WORD} confirmText='Delete' destructive title={<span className='text-destructive'><AlertTriangle className='me-1 inline-block stroke-destructive' size={18} /> Delete {selectedRows.length} {selectedRows.length === 1 ? 'user' : 'users'}</span>} desc={<form id='users-multi-delete-form' onSubmit={(event) => { event.preventDefault(); void handleDelete() }} className='space-y-4'><p>This action cannot be undone.</p><Label className='flex flex-col gap-2'>Type &quot;{CONFIRM_WORD}&quot; to confirm:<Input value={value} onChange={(event) => setValue(event.target.value)} autoFocus /></Label><Alert variant='destructive'><AlertTitle>Warning!</AlertTitle><AlertDescription>This operation cannot be rolled back.</AlertDescription></Alert></form>} />
}
