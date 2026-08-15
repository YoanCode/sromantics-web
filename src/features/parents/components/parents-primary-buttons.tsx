import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParents } from './parents-provider'

export function ParentsPrimaryButtons() {
  const { setOpen } = useParents()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Parent</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
