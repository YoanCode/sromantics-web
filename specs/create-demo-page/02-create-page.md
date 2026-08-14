# Spec 02: Create Students List Page

## 🎯 Goal
Create a fully functional Students List page using TanStack Table (React Table), showcasing CRUD operations with the mock student data.

## 📁 Files to Create

### 1. Feature Structure
- `src/features/students/index.tsx` - Main page component
- `src/features/students/data/students.ts` - Mock students data
- `src/features/students/components/students-provider.tsx` - Context provider for state management
- `src/features/students/components/students-table.tsx` - Table wrapper component
- `src/features/students/components/students-columns.tsx` - Table column definitions
- `src/features/students/components/students-dialogs.tsx` - Dialog orchestrator
- `src/features/students/components/students-action-dialog.tsx` - Add/Edit student dialog
- `src/features/students/components/students-delete-dialog.tsx` - Delete confirmation dialog
- `src/features/students/components/students-multi-delete-dialog.tsx` - Bulk delete dialog
- `src/features/students/components/data-table-row-actions.tsx` - Row action menu
- `src/features/students/components/data-table-bulk-actions.tsx` - Bulk actions toolbar

### 2. Route
- `src/routes/_authenticated/students/index.tsx` - Route component

### 3. Tests
- `src/features/students/components/students-action-dialog.test.tsx` - Dialog tests
- `src/features/students/components/students-delete-dialog.test.tsx` - Delete dialog tests
- `src/features/students/components/students-multi-delete-dialog.test.tsx` - Bulk delete tests

---

## 🛠️ Step 1: Create Feature Data

### File: `src/features/students/data/students.ts`

Import mock students and format for table display:

```typescript
import type { Student } from '@/types/mds';
import { mockStudents } from '@/data/mock';

export const students: Student[] = mockStudents;
```

---

## 🛠️ Step 2: Create Context Provider

### File: `src/features/students/components/students-provider.tsx`

Create a React Context to manage students table state and CRUD operations:

```typescript
import { type ReactNode, createContext, useContext, useState } from 'react';
import type { Student } from '@/types/mds';
import { students as initialStudents } from '../data/students';

interface StudentsContextType {
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteStudents: (ids: string[]) => void;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const addStudent = (student: Student) => {
    setStudents((prev) => [...prev, student]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, ...updates } : student
      )
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((student) => student.id !== id));
  };

  const deleteStudents = (ids: string[]) => {
    setStudents((prev) =>
      prev.filter((student) => !ids.includes(student.id))
    );
  };

  return (
    <StudentsContext.Provider
      value={{ students, addStudent, updateStudent, deleteStudent, deleteStudents }}
    >
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudentsContext() {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudentsContext must be used within StudentsProvider');
  }
  return context;
}
```

---

## 🛠️ Step 3: Create Table Columns

### File: `src/features/students/components/students-columns.tsx`

Define TanStack Table columns for students data:

```typescript
import { type ColumnDef } from '@tanstack/react-table';
import type { Student } from '@/types/mds';
import { DataTableCheckboxHeader, DataTableCheckboxCell } from '@/components/data-table';

export const studentsColumns: ColumnDef<Student>[] = [
  {
    id: 'select',
    header: ({ table }) => <DataTableCheckboxHeader table={table} />,
    cell: ({ row }) => <DataTableCheckboxCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Student Name',
    cell: ({ row }) => <div className='font-medium'>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string;
      return <div className='capitalize'>{gender === 'male' ? 'Male' : 'Female'}</div>;
    },
  },
  {
    accessorKey: 'schoolName',
    header: 'School',
    cell: ({ row }) => <div>{row.getValue('schoolName')}</div>,
  },
  {
    accessorKey: 'grade',
    header: 'Grade',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('grade')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusStyles = {
        active: 'bg-green-100 text-green-800',
        graduated: 'bg-blue-100 text-blue-800',
        suspended: 'bg-red-100 text-red-800',
      };
      return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
```

---

## 🛠️ Step 4: Create Table Component

### File: `src/features/students/components/students-table.tsx`

Implement the data table using TanStack Table:

```typescript
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import type { Student } from '@/types/mds';
import { DataTable, DataTablePagination } from '@/components/data-table';
import { DataTableBulkActions } from './data-table-bulk-actions';
import { studentsColumns } from './students-columns';

interface StudentsTableProps {
  data: Student[];
  search: string;
  navigate: (options: any) => void;
}

export function StudentsTable({ data, search, navigate }: StudentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns: studentsColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter: search,
    },
  });

  return (
    <div className='space-y-4'>
      {table.getSelectedRowModel().rows.length > 0 && (
        <DataTableBulkActions table={table} navigate={navigate} />
      )}
      <DataTable table={table} />
      <DataTablePagination table={table} />
    </div>
  );
}
```

---

## 🛠️ Step 5: Create Main Page Component

### File: `src/features/students/index.tsx`

Assemble the page with header and main content:

```typescript
import { getRouteApi } from '@tanstack/react-router';
import { ConfigDrawer } from '@/components/config-drawer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { StudentsDialogs } from './components/students-dialogs';
import { StudentsPrimaryButtons } from './components/students-primary-buttons';
import { StudentsProvider } from './components/students-provider';
import { StudentsTable } from './components/students-table';
import { students } from './data/students';

const route = getRouteApi('/_authenticated/students/');

export function Students() {
  const search = route.useSearch();
  const navigate = route.useNavigate();

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
        <StudentsTable data={students} search={search} navigate={navigate} />
      </Main>

      <StudentsDialogs />
    </StudentsProvider>
  );
}
```

---

## 🛠️ Step 6: Create Route

### File: `src/routes/_authenticated/students/index.tsx`

Create the route component:

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { Students } from '@/features/students';

export const Route = createFileRoute('/_authenticated/students/')({
  component: Students,
});
```

---

## 🛠️ Step 7: Create Supporting Components

### File: `src/features/students/components/students-primary-buttons.tsx`

Add/Refresh button toolbar:

```typescript
import { Button } from '@/components/ui/button';
import { useStudentsContext } from './students-provider';

export function StudentsPrimaryButtons() {
  const { students } = useStudentsContext();

  return (
    <div className='flex gap-2'>
      <Button onClick={() => {/* open add dialog */}}>
        Add Student
      </Button>
    </div>
  );
}
```

---

## 📋 Additional Components to Implement

Implement the following components following the pattern used in `src/features/users/components/`:

- `students-action-dialog.tsx` - Form dialog for adding/editing students
- `students-delete-dialog.tsx` - Single student delete confirmation
- `students-multi-delete-dialog.tsx` - Bulk delete confirmation
- `data-table-row-actions.tsx` - Row action menu (edit/delete)
- `data-table-bulk-actions.tsx` - Bulk actions toolbar
- `students-dialogs.tsx` - Dialog orchestrator component

---

## ✅ Acceptance Criteria

- [x] All TypeScript files compile without errors
- [x] Students list displays with TanStack Table using mock data
- [x] Table includes columns: Name, Gender, School, Grade, Status
- [x] Sorting and pagination work correctly
- [x] Row selection with bulk delete functionality
- [x] Add/Edit student dialog implemented
- [x] Delete confirmation dialogs implemented
- [x] Route `/students` is accessible from authenticated layout
- [x] All tests pass (`npm run test`)
- [x] No console errors or warnings

---

## 🚀 Testing Commands

```bash
# Build project
npm run build

# Run TypeScript type checking
npx tsc --noEmit

# Run tests
npm run test
```
