import { ParentsActionDialog } from './parents-action-dialog'
import { ParentsDeleteDialog } from './parents-delete-dialog'
import { useParents } from './parents-provider'

export function ParentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useParents()
  return (
    <>
      <ParentsActionDialog
        key='parent-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <ParentsActionDialog
            key={`parent-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ParentsDeleteDialog
            key={`parent-delete-${currentRow.id}`}
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
