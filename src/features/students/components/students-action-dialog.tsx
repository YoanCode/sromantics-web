'use client'

import { useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Student } from '@/types/mds'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'

const formSchema = z.object({
  id: z.string(),
  parentId: z.string().min(1, 'Parent is required.'),
  name: z.string().min(2, 'Student name is required.'),
  gender: z.enum(['male', 'female']),
  schoolName: z.string().min(1, 'School name is required.'),
  grade: z.string().min(1, 'Grade is required.'),
  note: z.string().optional(),
  status: z.enum(['active', 'graduated', 'suspended']),
})

type StudentForm = z.infer<typeof formSchema>

type StudentActionDialogProps = {
  currentRow?: Student
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: StudentActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<StudentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          id: '', // Will be generated on server or in provider
          parentId: '',
          name: '',
          gender: 'male',
          schoolName: '',
          grade: '',
          note: '',
          status: 'active',
        },
  })

  const onSubmit = useCallback(
    (values: StudentForm) => {
      // Generate ID for new student if not present
      const dataToSubmit = {
        ...values,
        id: values.id || `s_${Math.random().toString(36).substr(2, 9)}`,
      }
      form.reset()
      showSubmittedData(dataToSubmit)
      onOpenChange(false)
    },
    [form, onOpenChange]
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the student here. ' : 'Create new student here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter student name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      items={[
                        { label: 'Male', value: 'male' },
                        { label: 'Female', value: 'female' },
                      ]}
                      placeholder='Select gender'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='schoolName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter school name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='grade'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter grade' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      items={[
                        { label: 'Active', value: 'active' },
                        { label: 'Graduated', value: 'graduated' },
                        { label: 'Suspended', value: 'suspended' },
                      ]}
                      placeholder='Select status'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter note' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit'>Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
