import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ParentsDialogs } from './components/parents-dialogs'
import { ParentsPrimaryButtons } from './components/parents-primary-buttons'
import { ParentsProvider } from './components/parents-provider'
import { ParentsTable } from './components/parents-table'
import { useParentsQuery } from './queries'

const route = getRouteApi('/_authenticated/parents/')

export function Parents() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data: parents = [], isLoading } = useParentsQuery()

  return (
    <ParentsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Parents List</h2>
            <p className='text-muted-foreground'>
              Manage your parents and their contact information here.
            </p>
          </div>
          <ParentsPrimaryButtons />
        </div>
        {isLoading ? (
          <p className='text-muted-foreground'>Loading...</p>
        ) : (
          <ParentsTable
            data={parents}
            search={search as Record<string, unknown>}
            navigate={navigate}
          />
        )}
      </Main>

      <ParentsDialogs />
    </ParentsProvider>
  )
}
