import { z } from 'zod'

// 1. Parent Schema & Type
export const parentSchema = z.object({
  id: z.string(),
  name: z.string().min(2, '姓名至少需 2 個字'),
  phone: z.string().regex(/^09\d{8}$/, '請輸入正確的台灣手機號碼 (09xxxxxxxx)'),
  email: z.string().email('Email 格式不正確').optional().or(z.literal('')),
  relationship: z.enum(['father', 'mother', 'guardian'], {
    message: '請選擇關係',
  }),
})
export type Parent = z.infer<typeof parentSchema>

// 2. Student Schema & Type
export const studentSchema = z.object({
  id: z.string(),
  parentId: z.string().min(1, '請選擇關聯家長'),
  name: z.string().min(2, '學生姓名至少需 2 個字'),
  gender: z.enum(['male', 'female']),
  schoolName: z.string().min(1, '請輸入學校名稱'),
  grade: z.string().min(1, '請選擇年級'),
  note: z.string().optional(),
  status: z.enum(['active', 'graduated', 'suspended']).default('active'),
})
export type Student = z.infer<typeof studentSchema>

// 3. Course Schema & Type
export const courseSchema = z.object({
  id: z.string(),
  name: z.string().min(2, '課程名稱至少需 2 個字'),
  category: z.enum(['math', 'english', 'science', 'other']),
  description: z.string().optional(),
})
export type Course = z.infer<typeof courseSchema>

// 4. Class Schema & Type
export const classSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  className: z.string().min(2, '班級名稱不可為空'),
  teacherName: z.string().min(1, '請輸入授課教師'),
  classroom: z.string().min(1, '請輸入教室名稱'),
  dayOfWeek: z.number().min(1).max(7),
  startTime: z.string(),
  endTime: z.string(),
  maxCapacity: z.number().min(1, '人數至少需 1 人'),
  pricePerPeriod: z.number().min(0, '價格不可為負數'),
})
export type Class = z.infer<typeof classSchema>

// 5. Student course balance Schema & Type
export const studentCourseSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  courseId: z.string(),
  enrolledAt: z.string(),
  paymentStatus: z.enum(['paid', 'unpaid', 'partial']),
  purchasedLessons: z.number().int().min(0),
  usedLessons: z.number().int().min(0),
  remainingLessons: z.number().int().min(0),
  status: z.enum(['active', 'completed', 'cancelled']),
})
export type StudentCourse = z.infer<typeof studentCourseSchema>

// 6. Class membership history Schema & Type
export const enrollmentSchema = z.object({
  id: z.string(),
  studentCourseId: z.string(),
  classId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  status: z.enum(['active', 'transferred', 'completed', 'cancelled']),
})
export type Enrollment = z.infer<typeof enrollmentSchema>

// 7. Attendance Schema & Type
export const attendanceSchema = z.object({
  id: z.string(),
  enrollmentId: z.string(),
  studentCourseId: z.string(),
  classId: z.string(),
  attendanceDate: z.string(),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  makeUpCreditId: z.string().optional(),
  note: z.string().optional(),
  recordedAt: z.string().optional(),
})
export type Attendance = z.infer<typeof attendanceSchema>

export const makeUpCreditSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  sourceAttendanceId: z.string(),
  sourceEnrollmentId: z.string(),
  validUntil: z.string(),
  status: z.enum(['available', 'scheduled', 'used', 'expired', 'cancelled']),
  targetClassId: z.string().optional(),
  targetDate: z.string().optional(),
  usedAttendanceId: z.string().optional(),
  note: z.string().optional(),
  createdAt: z.string().optional(),
  usedAt: z.string().optional(),
})
export type MakeUpCredit = z.infer<typeof makeUpCreditSchema>
