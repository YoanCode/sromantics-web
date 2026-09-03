import type { ColumnDef } from '@tanstack/react-table'
import type { User } from '@/types/user'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { roles } from '../data/data'
import { DataTableRowActions } from './data-table-row-actions'

const statusFor = (user: User) => {
  if (!user.enabled) return 'disabled'
  if (!user.accountNonLocked) return 'locked'
  return 'active'
}

export const usersColumns: ColumnDef<User>[] = [
  { id: 'select', header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label='Select all' className='translate-y-0.5' />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' className='translate-y-0.5' />, enableSorting: false, enableHiding: false, meta: { className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky') } },
  { accessorKey: 'username', header: ({ column }) => <DataTableColumnHeader column={column} title='Username' />, cell: ({ row }) => <span className='font-medium'>{row.getValue('username')}</span>, enableHiding: false },
  { accessorKey: 'displayName', header: ({ column }) => <DataTableColumnHeader column={column} title='Name' /> },
  { accessorKey: 'email', header: ({ column }) => <DataTableColumnHeader column={column} title='Email' /> },
  { id: 'role', accessorFn: (user) => user.roles, header: ({ column }) => <DataTableColumnHeader column={column} title='Roles' />, cell: ({ row }) => <div className='flex flex-wrap gap-1'>{row.original.roles.map((role) => <Badge key={role} variant='outline'>{roles.find((item) => item.value === role)?.label ?? role}</Badge>)}</div>, filterFn: (row, _, values: string[]) => values.length === 0 || row.original.roles.some((role) => values.includes(role)), enableSorting: false },
  { id: 'status', accessorFn: statusFor, header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />, cell: ({ row }) => { const status = statusFor(row.original); const styles = { active: 'bg-teal-100/30 text-teal-900 dark:text-teal-200', disabled: 'bg-neutral-300/40', locked: 'bg-destructive/10 text-destructive' }; const labels = { active: 'Active', disabled: 'Disabled', locked: 'Locked' }; return <Badge variant='outline' className={styles[status]}>{labels[status]}</Badge> }, filterFn: (row, _, values: string[]) => values.length === 0 || values.includes(statusFor(row.original)), enableSorting: false },
  { accessorKey: 'updatedAt', header: ({ column }) => <DataTableColumnHeader column={column} title='Updated' />, cell: ({ row }) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(row.original.updatedAt)) },
  { id: 'actions', cell: DataTableRowActions, enableHiding: false },
]
