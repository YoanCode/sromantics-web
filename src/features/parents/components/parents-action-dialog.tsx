'use client'

import { useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Parent } from '@/types/mds'
import { useParents } from './parents-provider'
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
  name: z.string().min(2, '姓名至少需 2 個字'),
  phone: z.string().regex(/^09\d{8}$/, '請輸入正確的台灣手機號碼 (09xxxxxxxx)'),
  email: z.string().email('Email 格式不正確').optional().or(z.literal('')),
  relationship: z.enum(['father', 'mother', 'guardian'], {
    message: '請選擇關係',
  }),
})

type ParentForm = z.infer<typeof formSchema>

type ParentsActionDialogProps = {
  currentRow?: Parent
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ParentsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ParentsActionDialogProps) {
  const isEdit = !!currentRow
  const { onCreate, onUpdate } = useParents()
  const form = useForm<ParentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? { ...currentRow, email: currentRow.email ?? '' }
      : {
          id: '',
          name: '',
          phone: '',
          email: '',
          relationship: 'father',
        },
  })

  const onSubmit = useCallback(
    (values: ParentForm) => {
      if (isEdit) {
        onUpdate(currentRow!.id, values as Parent)
      } else {
        const { id: _id, ...payload } = values
        onCreate(payload)
      }
      form.reset()
      onOpenChange(false)
    },
    [form, isEdit, currentRow, onCreate, onUpdate, onOpenChange]
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
            {isEdit ? 'Edit Parent' : 'Add New Parent'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the parent here. ' : 'Create new parent here. '}
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
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input placeholder='請輸入姓名' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>手機號碼</FormLabel>
                  <FormControl>
                    <Input placeholder='09xxxxxxxx' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email（選填）</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='example@email.com'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='relationship'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>與學生關係</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      items={[
                        { label: '父親', value: 'father' },
                        { label: '母親', value: 'mother' },
                        { label: '監護人', value: 'guardian' },
                      ]}
                      placeholder='請選擇關係'
                    />
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
