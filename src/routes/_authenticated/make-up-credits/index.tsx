import { createFileRoute } from '@tanstack/react-router'
import { MakeUpCreditsPage } from '@/features/make-up-credits'

export const Route = createFileRoute('/_authenticated/make-up-credits/')({
  component: MakeUpCreditsPage,
})