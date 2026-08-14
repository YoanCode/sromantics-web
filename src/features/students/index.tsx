import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { StudentsDialogs } from './components/students-dialogs'
import { StudentsPrimaryButtons } from './components/students-primary-buttons'
import { StudentsProvider } from './components/students-provider'
import { StudentsTable } from './components/students-table'
import { students } from './data/students'

// @ts-expect-error - Route will be registered at runtime
const route = getRouteApi('/_authenticated/students/')

export function Students() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <StudentsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Students List</h2>
            <p className='text-muted-foreground'>
              Manage your students and their enrollment status here.
            </p>
          </div>
          <StudentsPrimaryButtons />
        </div>
        <StudentsTable
          data={students}
          search={search as Record<string, unknown>}
          navigate={navigate as any}
        />
      </Main>

      <StudentsDialogs />
    </StudentsProvider>
  )
}
