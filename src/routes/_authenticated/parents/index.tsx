import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Parents } from '@/features/parents'

const parentsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  relationship: z
    .array(z.enum(['father', 'mother', 'guardian']))
    .optional()
    .catch([]),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/parents/')({
  validateSearch: parentsSearchSchema,
  component: Parents,
})
