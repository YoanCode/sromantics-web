import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStudents } from './students-provider'

export function StudentsPrimaryButtons() {
  const { setOpen } = useStudents()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Student</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
