import React, { useState } from 'react'
import type { Parent } from '@/types/mds'
import useDialogState from '@/hooks/use-dialog-state'
import {
  useCreateParentMutation,
  useDeleteParentMutation,
  useUpdateParentMutation,
} from '../queries'

type ParentsDialogType = 'add' | 'edit' | 'delete'

type ParentsContextType = {
  open: ParentsDialogType | null
  setOpen: (str: ParentsDialogType | null) => void
  currentRow: Parent | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Parent | null>>
  onCreate: (data: Omit<Parent, 'id'>) => void
  onUpdate: (id: string, data: Parent) => void
  onDelete: (id: string) => void
  onDeleteAsync: (id: string) => Promise<void>
}

const ParentsContext = React.createContext<ParentsContextType | null>(null)

export function ParentsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ParentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Parent | null>(null)

  const createMutation = useCreateParentMutation()
  const updateMutation = useUpdateParentMutation()
  const deleteMutation = useDeleteParentMutation()

  return (
    <ParentsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        onCreate: (data) => createMutation.mutate(data),
        onUpdate: (id, data) => updateMutation.mutate({ id, data }),
        onDelete: (id) => deleteMutation.mutate(id),
        onDeleteAsync: (id) => deleteMutation.mutateAsync(id),
      }}
    >
      {children}
    </ParentsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useParents = () => {
  const parentsContext = React.useContext(ParentsContext)

  if (!parentsContext) {
    throw new Error('useParents has to be used within <ParentsContext>')
  }

  return parentsContext
}
