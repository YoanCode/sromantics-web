import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

function ProtectedLayout() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      // Save original path for redirect after login
      const currentPath = window.location.pathname + window.location.search

      // Navigate to sign-in with redirect parameter
      navigate({
        to: '/sign-in',
        search: {
          redirect: currentPath,
        },
        replace: true,
      })
    }
  }, [auth, navigate])

  if (!auth.isAuthenticated()) {
    return null
  }

  return <AuthenticatedLayout />
}

export const Route = createFileRoute('/_authenticated')({
  component: ProtectedLayout,
})
