import React, { useState } from 'react'
import type { Student } from '@/types/mds'
import useDialogState from '@/hooks/use-dialog-state'

type StudentsDialogType = 'add' | 'edit' | 'delete'

type StudentsContextType = {
  open: StudentsDialogType | null
  setOpen: (str: StudentsDialogType | null) => void
  currentRow: Student | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Student | null>>
}

const StudentsContext = React.createContext<StudentsContextType | null>(null)

export function StudentsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StudentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Student | null>(null)

  return (
    <StudentsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </StudentsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStudents = () => {
  const studentsContext = React.useContext(StudentsContext)

  if (!studentsContext) {
    throw new Error('useStudents has to be used within <StudentsContext>')
  }

  return studentsContext
}
