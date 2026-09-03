import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type {
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
  User,
} from '@/types/user'
import {
  useChangePasswordMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from '../queries'

type UsersDialogType = 'add' | 'edit' | 'change-password' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  onCreate: (data: CreateUserInput) => void
  onUpdate: (id: string, data: UpdateUserInput) => void
  onChangePassword: (id: string, data: ChangePasswordInput) => void
  onDelete: (id: string) => void
  onDeleteAsync: (id: string) => Promise<unknown>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()
  const changePasswordMutation = useChangePasswordMutation()
  const deleteMutation = useDeleteUserMutation()

  return (
    <UsersContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        onCreate: (data) => createMutation.mutate(data),
        onUpdate: (id, data) => updateMutation.mutate({ id, data }),
        onChangePassword: (id, data) =>
          changePasswordMutation.mutate({ id, data }),
        onDelete: (id) => deleteMutation.mutate(id),
        onDeleteAsync: (id) => deleteMutation.mutateAsync(id),
      }}
    >
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
