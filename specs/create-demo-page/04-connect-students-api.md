# Spec 04: Connect Students Page to API

## 🎯 Goal

Replace the mock data in the Students page with live data from `sromantics-api`. Use **TanStack Query** for server state and **axios** for HTTP requests. All CRUD operations (add, edit, delete, bulk delete) must call the real API.

---

## 📁 Files to Create

```
src/
├── lib/
│   └── api-client.ts          ← axios instance with base URL
└── features/students/
    ├── api.ts                 ← raw API functions
    └── queries.ts             ← TanStack Query hooks
```

## 📝 Files to Modify

```
src/features/students/
├── index.tsx                               ← use query data instead of mock
├── components/
│   ├── students-provider.tsx               ← expose mutation callbacks via context
│   ├── students-action-dialog.tsx          ← call create/update mutation on submit
│   ├── students-delete-dialog.tsx          ← call delete mutation on confirm
│   └── students-multi-delete-dialog.tsx    ← call delete mutation for each selected row
```

---

## 🛠️ Step 1: Create `.env`

```
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🛠️ Step 2: Create `src/lib/api-client.ts`

Axios instance that reads the base URL from the env variable.

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export default apiClient
```

---

## 🛠️ Step 3: Create `src/features/students/api.ts`

Raw async functions, one per API operation. No Query logic here.

```typescript
import type { Student } from '@/types/mds'
import apiClient from '@/lib/api-client'

const BASE = '/api/students'

export const studentsApi = {
  list: async (): Promise<Student[]> => {
    const { data } = await apiClient.get<Student[]>(BASE)
    return data
  },

  create: async (payload: Omit<Student, 'id'>): Promise<Student> => {
    const { data } = await apiClient.post<Student>(BASE, payload)
    return data
  },

  update: async (id: string, payload: Student): Promise<Student> => {
    const { data } = await apiClient.put<Student>(`${BASE}/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
```

---

## 🛠️ Step 4: Create `src/features/students/queries.ts`

TanStack Query hooks wrapping `studentsApi`. Mutations invalidate `['students']` on success.

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Student } from '@/types/mds'
import { studentsApi } from './api'

export const STUDENTS_KEY = ['students'] as const

export function useStudentsQuery() {
  return useQuery({
    queryKey: STUDENTS_KEY,
    queryFn: studentsApi.list,
  })
}

export function useCreateStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      toast.success('Student added successfully.')
    },
    onError: () => toast.error('Failed to add student.'),
  })
}

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Student }) =>
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      toast.success('Student updated successfully.')
    },
    onError: () => toast.error('Failed to update student.'),
  })
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      toast.success('Student deleted.')
    },
    onError: () => toast.error('Failed to delete student.'),
  })
}
```

---

## 🛠️ Step 5: Update `students-provider.tsx`

Expose mutation callbacks in context so dialogs can call them without prop drilling.

Add `onCreate`, `onUpdate`, `onDelete` to `StudentsContextType`:

```typescript
type StudentsContextType = {
  open: StudentsDialogType | null
  setOpen: (str: StudentsDialogType | null) => void
  currentRow: Student | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Student | null>>
  onCreate: (data: Omit<Student, 'id'>) => void
  onUpdate: (id: string, data: Student) => void
  onDelete: (id: string) => void
  onDeleteAsync: (id: string) => Promise<void>  // for awaitable bulk delete
}
```

Inside `StudentsProvider`, instantiate the three mutations and wire them:

```typescript
const createMutation = useCreateStudentMutation()
const updateMutation = useUpdateStudentMutation()
const deleteMutation = useDeleteStudentMutation()

// pass into context value:
onCreate: (data) => createMutation.mutate(data),
onUpdate: (id, data) => updateMutation.mutate({ id, data }),
onDelete: (id) => deleteMutation.mutate(id),
onDeleteAsync: (id) => deleteMutation.mutateAsync(id),
```

---

## 🛠️ Step 6: Update `index.tsx`

Replace the static import of `students` with `useStudentsQuery`. Pass query data to `StudentsTable`. Show a loading state while fetching.

```typescript
// Remove: import { students } from './data/students'
const { data: students = [], isLoading } = useStudentsQuery()

// In JSX, replace:
<StudentsTable data={students} ... />
// with a loading guard:
{isLoading ? (
  <p className='text-muted-foreground'>Loading...</p>
) : (
  <StudentsTable data={students} ... />
)}
```

---

## 🛠️ Step 7: Update `students-action-dialog.tsx`

Replace `showSubmittedData` with context mutations:

```typescript
const { onCreate, onUpdate, currentRow } = useStudents()

const onSubmit = useCallback((values: StudentForm) => {
  if (isEdit) {
    onUpdate(currentRow!.id, values as Student)
  } else {
    const { id: _id, ...payload } = values
    onCreate(payload)
  }
  form.reset()
  onOpenChange(false)
}, [form, isEdit, currentRow, onCreate, onUpdate, onOpenChange])
```

---

## 🛠️ Step 8: Update `students-delete-dialog.tsx`

Replace `showSubmittedData` with `onDelete` from context:

```typescript
const { onDelete } = useStudents()

const handleDelete = () => {
  if (value.trim() !== currentRow.name) return
  onDelete(currentRow.id)
  onOpenChange(false)
}
```

---

## 🛠️ Step 9: Update `students-multi-delete-dialog.tsx`

Replace the fake `sleep` toast with real delete calls. Delete all selected rows in parallel:

```typescript
const { onDeleteAsync } = useStudents()

const handleDelete = async () => {
  if (value.trim() !== CONFIRM_WORD) {
    toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
    return
  }
  const ids = selectedRows.map((r) => (r.original as Student).id)
  await Promise.all(ids.map((id) => onDeleteAsync(id)))
  setValue('')
  table.resetRowSelection()
  onOpenChange(false)
}
```

---

## ✅ Verification

1. Start `sromantics-api` on port 8080
2. Start `sromantics-web` dev server
3. Open the Students page — list should load 2 students from the API (not mock)
4. Add a new student → row appears in table, persists after page refresh
5. Edit a student → changes persist after page refresh
6. Delete a student → row removed, persists after page refresh
7. Open Network tab: confirm requests go to `http://localhost:8080/api/students`

---

## 🐛 Known Issues & Fixes

### Save button has no response (parentId validation fails silently)

**Root cause**: `formSchema` defines `parentId: z.string().min(1, 'Parent is required.')` but the form UI had no `<FormField>` for `parentId`. When creating a new student, `parentId` defaults to `''`, Zod validation fails, and `onSubmit` is never called — with no visible error because there is no field to display the message on.

This bug was masked in the original mock-data implementation since `showSubmittedData` bypassed form validation entirely.

**Fix**: Add a `parentId` `<FormField>` to `students-action-dialog.tsx` (placed before the `name` field):

```tsx
<FormField
  control={form.control}
  name='parentId'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Parent ID</FormLabel>
      <FormControl>
        <Input placeholder='Enter parent ID' {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### `note` field renders null warning

**Root cause**: The API returns `note: null` for students without a note. Spreading `field` onto `<Input>` sets `value={null}`, which React warns against.

**Fix**: Add `value={field.value ?? ''}` to override null with empty string:

```tsx
<Input placeholder='Enter note' {...field} value={field.value ?? ''} />
```

> **Future improvement**: Replace the free-text `parentId` input with a `<SelectDropdown>` once a `GET /api/parents` endpoint is available.

### Dialog tests fail with `useStudents has to be used within <StudentsContext>`

**Root cause**: After wiring dialogs to `useStudents()`, existing tests that render dialogs in isolation no longer have a `StudentsProvider` ancestor, causing the context guard to throw.

The original tests also mocked `@/lib/show-submitted-data` which is now removed from the dialog source files — leaving a stale, unused mock.

**Fix**: Add `vi.mock('./students-provider', ...)` to each dialog test file, and remove the obsolete `show-submitted-data` mock:

```typescript
// students-action-dialog.test.tsx & students-delete-dialog.test.tsx
vi.mock('./students-provider', () => ({
  useStudents: () => ({
    onCreate: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onDeleteAsync: vi.fn(),
    open: null,
    setOpen: vi.fn(),
    currentRow: null,
    setCurrentRow: vi.fn(),
  }),
}))

// students-multi-delete-dialog.test.tsx
vi.mock('./students-provider', () => ({
  useStudents: () => ({
    onDeleteAsync: vi.fn().mockResolvedValue(undefined),
    // ... other fields
  }),
}))
```
