import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Field = {
  key: string
  label: string
  type?: 'text' | 'number'
}

type ResourceRow = Record<string, unknown> & { id: string }

type CrudResourcePageProps = {
  title: string
  description: string
  resourceLabel: string
  fields: Field[]
  rows: ResourceRow[]
  isLoading: boolean
  onCreate: (data: Record<string, unknown>) => Promise<unknown>
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}

function toFormData(row: ResourceRow | undefined, fields: Field[]) {
  return Object.fromEntries(
    fields.map((field) => [field.key, row?.[field.key] ?? ''])
  )
}

export function CrudResourcePage({
  title,
  description,
  resourceLabel,
  fields,
  rows,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
}: CrudResourcePageProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<ResourceRow>()
  const [form, setForm] = useState<Record<string, unknown>>(
    toFormData(undefined, fields)
  )
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditingRow(undefined)
    setForm(toFormData(undefined, fields))
    setDialogOpen(true)
  }

  const openEdit = (row: ResourceRow) => {
    setEditingRow(row)
    setForm(toFormData(row, fields))
    setDialogOpen(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        fields.map((field) => {
          const value = form[field.key]
          return [
            field.key,
            field.type === 'number' ? Number(value) : value,
          ]
        })
      )
      if (editingRow) {
        await onUpdate(editingRow.id, { ...payload, id: editingRow.id })
      } else {
        await onCreate(payload)
      }
      setDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground'>{description}</p>
          </div>
          <Button onClick={openCreate}>Add {resourceLabel}</Button>
        </div>
        {isLoading ? (
          <p className='text-muted-foreground'>Loading...</p>
        ) : (
          <div className='overflow-x-auto rounded-md border'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50 text-left'>
                <tr>
                  <th className='px-4 py-3'>ID</th>
                  {fields.map((field) => (
                    <th key={field.key} className='px-4 py-3'>
                      {field.label}
                    </th>
                  ))}
                  <th className='px-4 py-3'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className='border-t'>
                    <td className='px-4 py-3 font-mono text-xs'>{row.id}</td>
                    {fields.map((field) => (
                      <td key={field.key} className='px-4 py-3'>
                        {String(row[field.key] ?? '')}
                      </td>
                    ))}
                    <td className='px-4 py-3'>
                      <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={() => openEdit(row)}>
                          Edit
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => void onDelete(row.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={fields.length + 2}
                      className='px-4 py-8 text-center text-muted-foreground'
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <span className='hidden' />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRow ? `Edit ${resourceLabel}` : `Add ${resourceLabel}`}
            </DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            {fields.map((field) => (
              <div key={field.key} className='grid gap-2'>
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type ?? 'text'}
                  value={String(form[field.key] ?? '')}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={() => void submit()}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
