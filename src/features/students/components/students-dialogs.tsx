import { StudentsActionDialog } from './students-action-dialog'
import { StudentsDeleteDialog } from './students-delete-dialog'
import { useStudents } from './students-provider'

export function StudentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStudents()
  return (
    <>
      <StudentsActionDialog
        key='student-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <StudentsActionDialog
            key={`student-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <StudentsDeleteDialog
            key={`student-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
