import { useState } from 'react'
import type { Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import type { User } from '@/types/user'
import { Button } from '@/components/ui/button'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps = { table: Table<User> }

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  return <><BulkActionsToolbar table={table} entityName='user'><Tooltip><TooltipTrigger asChild><Button variant='destructive' size='icon' onClick={() => setShowDeleteConfirm(true)} className='size-8' aria-label='Delete selected users'><Trash2 size={18} /><span className='sr-only'>Delete selected users</span></Button></TooltipTrigger><TooltipContent><p>Delete selected users</p></TooltipContent></Tooltip></BulkActionsToolbar><UsersMultiDeleteDialog table={table} open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} /></>
}
