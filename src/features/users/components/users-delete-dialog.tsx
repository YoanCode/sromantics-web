'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { User } from '@/types/user'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUsers } from './users-provider'

type UsersDeleteDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; currentRow: User }

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: UsersDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { onDelete } = useUsers()
  const handleDelete = () => {
    if (value.trim() !== currentRow.username) return
    onDelete(currentRow.id)
    setValue('')
    onOpenChange(false)
  }
  return <ConfirmDialog open={open} onOpenChange={onOpenChange} form='users-delete-form' disabled={value.trim() !== currentRow.username} confirmText='Delete' destructive title={<span className='text-destructive'><AlertTriangle className='me-1 inline-block stroke-destructive' size={18} /> Delete User</span>} desc={<form id='users-delete-form' onSubmit={(event) => { event.preventDefault(); handleDelete() }} className='space-y-4'><p>Delete <span className='font-bold'>{currentRow.username}</span>? This cannot be undone.</p><Label className='flex flex-col gap-2'>Enter username to confirm:<Input value={value} onChange={(event) => setValue(event.target.value)} autoFocus /></Label><Alert variant='destructive'><AlertTitle>Warning!</AlertTitle><AlertDescription>This operation cannot be rolled back.</AlertDescription></Alert></form>} />
}
