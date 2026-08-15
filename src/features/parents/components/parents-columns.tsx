import { type ColumnDef } from '@tanstack/react-table'
import type { Parent } from '@/types/mds'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'

const RELATIONSHIP_LABELS: Record<string, string> = {
  father: '父親',
  mother: '母親',
  guardian: '監護人',
}

export const parentsColumns: ColumnDef<Parent>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    meta: {
      className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='姓名' />
    ),
    cell: ({ row }) => <span className='font-medium'>{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='手機' />
    ),
    cell: ({ row }) => row.getValue('phone'),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => row.getValue('email') || '—',
  },
  {
    accessorKey: 'relationship',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='關係' />
    ),
    cell: ({ row }) =>
      RELATIONSHIP_LABELS[row.getValue('relationship') as string] ??
      row.getValue('relationship'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
