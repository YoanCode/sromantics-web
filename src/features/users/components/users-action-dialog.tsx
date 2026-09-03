'use client'

import { useCallback } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { User, UserRole } from '@/types/user'
import { userRoleSchema } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { roles } from '../data/data'
import { useUsers } from './users-provider'

const formSchema = z.object({
  username: z.string().trim().min(3, '帳號至少需 3 個字元').max(50),
  email: z.string().trim().toLowerCase().email('Email 格式不正確'),
  displayName: z.string().trim().min(1, '請輸入顯示名稱').max(100),
  roles: z.array(userRoleSchema).min(1, '請至少選擇一個角色'),
  enabled: z.boolean(),
  accountNonLocked: z.boolean(),
  password: z.string(),
  confirmPassword: z.string(),
  isEdit: z.boolean(),
}).superRefine((data, context) => {
  if (data.isEdit) return
  if (data.password.length < 8 || data.password.length > 72) {
    context.addIssue({ code: 'custom', message: '密碼長度需介於 8 至 72 個字元', path: ['password'] })
  }
  if (data.password !== data.confirmPassword) {
    context.addIssue({ code: 'custom', message: '密碼不一致', path: ['confirmPassword'] })
  }
})
type UserForm = z.infer<typeof formSchema>

type UsersActionDialogProps = { currentRow?: User; open: boolean; onOpenChange: (open: boolean) => void }

export function UsersActionDialog({ currentRow, open, onOpenChange }: UsersActionDialogProps) {
  const isEdit = !!currentRow
  const { onCreate, onUpdate } = useUsers()
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? { username: currentRow.username, email: currentRow.email, displayName: currentRow.displayName, roles: currentRow.roles, enabled: currentRow.enabled, accountNonLocked: currentRow.accountNonLocked, password: '', confirmPassword: '', isEdit: true }
      : { username: '', email: '', displayName: '', roles: [], enabled: true, accountNonLocked: true, password: '', confirmPassword: '', isEdit: false },
  })
  const onSubmit = useCallback((values: UserForm) => {
    if (currentRow) {
      onUpdate(currentRow.id, { email: values.email, displayName: values.displayName, roles: values.roles, enabled: values.enabled, accountNonLocked: values.accountNonLocked })
    } else {
      onCreate({ username: values.username, email: values.email, displayName: values.displayName, password: values.password, roles: values.roles })
    }
    form.reset()
    onOpenChange(false)
  }, [currentRow, form, onCreate, onOpenChange, onUpdate])
  const toggleRole = (role: UserRole, checked: boolean) => {
    const currentRoles = form.getValues('roles')
    form.setValue('roles', checked ? [...currentRoles, role] : currentRoles.filter((item) => item !== role), { shouldValidate: true })
  }
  return <Dialog open={open} onOpenChange={(state) => { form.reset(); onOpenChange(state) }}>
    <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
      <DialogHeader className='text-start'><DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle><DialogDescription>{isEdit ? 'Update the user account and access settings.' : 'Create a new user account.'}</DialogDescription></DialogHeader>
      <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField control={form.control} name='username' render={({ field }) => <FormItem><FormLabel>Username</FormLabel><FormControl><Input autoComplete='username' disabled={isEdit} {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name='displayName' render={({ field }) => <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name='email' render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input type='email' autoComplete='email' {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name='roles' render={() => <FormItem><FormLabel>Roles</FormLabel><div className='space-y-2 rounded-md border p-3'>{roles.map((role) => <label key={role.value} className='flex items-center gap-2 text-sm'><Checkbox checked={form.watch('roles').includes(role.value)} onCheckedChange={(checked) => toggleRole(role.value, checked === true)} />{role.label}</label>)}</div><FormMessage /></FormItem>} />
        {!isEdit && <><FormField control={form.control} name='password' render={({ field }) => <FormItem><FormLabel>Password</FormLabel><FormControl><PasswordInput autoComplete='new-password' {...field} /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name='confirmPassword' render={({ field }) => <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><PasswordInput autoComplete='new-password' {...field} /></FormControl><FormMessage /></FormItem>} /></>}
        {isEdit && <div className='space-y-3 rounded-md border p-3'><FormField control={form.control} name='enabled' render={({ field }) => <FormItem className='flex items-center justify-between space-y-0'><FormLabel>Account enabled</FormLabel><FormControl><Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} /></FormControl></FormItem>} /><FormField control={form.control} name='accountNonLocked' render={({ field }) => <FormItem className='flex items-center justify-between space-y-0'><FormLabel>Account unlocked</FormLabel><FormControl><Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} /></FormControl></FormItem>} /></div>}
        <DialogFooter><Button type='submit'>Save</Button></DialogFooter>
      </form></Form>
    </DialogContent>
  </Dialog>
}
