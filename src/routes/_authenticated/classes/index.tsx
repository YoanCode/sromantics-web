import { createFileRoute } from '@tanstack/react-router'
import { Classes } from '@/features/classes'

export const Route = createFileRoute('/_authenticated/classes/')({
  component: Classes,
})
