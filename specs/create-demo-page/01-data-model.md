# Spec 01: MDS Data Models & Mock Data Setup

## 🎯 Goal
Set up the core data models and mock dataset for the Cram School Management System (MDS).

## 📁 Files to Create
1. `src/types/mds.ts` - Zod schemas and inferred TypeScript types.
2. `src/data/mock.ts` - Initial mock data for development.

---

## 🛠️ Step 1: Create `src/types/mds.ts`

Define the relational schemas for `Parent`, `Student`, `Course`, `Class`, and `Enrollment` using **Zod**, and export their inferred TypeScript types.

```typescript
import { z } from 'zod';

// 1. Parent Schema & Type
export const parentSchema = z.object({
  id: z.string(),
  name: z.string().min(2, '姓名至少需 2 個字'),
  phone: z.string().regex(/^09\d{8}$/, '請輸入正確的台灣手機號碼 (09xxxxxxxx)'),
  email: z.string().email('Email 格式不正確').optional().or(z.literal('')),
  relationship: z.enum(['father', 'mother', 'guardian'], {
    message: '請選擇關係',
  }),
});
export type Parent = z.infer<typeof parentSchema>;

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
});
export type Student = z.infer<typeof studentSchema>;

// 3. Course Schema & Type
export const courseSchema = z.object({
  id: z.string(),
  name: z.string().min(2, '課程名稱至少需 2 個字'),
  category: z.enum(['math', 'english', 'science', 'other']),
  description: z.string().optional(),
});
export type Course = z.infer<typeof courseSchema>;

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
});
export type Class = z.infer<typeof classSchema>;

// 5. Enrollment Schema & Type
export const enrollmentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  classId: z.string(),
  enrolledAt: z.string(),
  paymentStatus: z.enum(['paid', 'unpaid', 'partial']),
  remainingLessons: z.number().min(0),
});
export type Enrollment = z.infer<typeof enrollmentSchema>;
```
# 🛠️ Step 2: Create src/data/mock.ts
Create structured relational mock data referencing the types from src/types/mds.ts.

```TypeScript
import type { Parent, Student, Course, Class, Enrollment } from '@/types/mds';

export const mockParents: Parent[] = [
  {
    id: 'p_001',
    name: '王大明',
    phone: '0912345678',
    email: 'daming.wang@example.com',
    relationship: 'father',
  },
];

export const mockStudents: Student[] = [
  {
    id: 's_001',
    parentId: 'p_001',
    name: '王小智',
    gender: 'male',
    schoolName: '東山國中',
    grade: '國二',
    note: '對海鮮過敏，下課需要家長接送',
    status: 'active',
  },
  {
    id: 's_002',
    parentId: 'p_001',
    name: '王小美',
    gender: 'female',
    schoolName: '東山國小',
    grade: '小六',
    status: 'active',
  },
];

export const mockCourses: Course[] = [
  {
    id: 'c_math',
    name: '國中數學拔尖',
    category: 'math',
    description: '針對國中段考與會考進階題型訓練',
  },
  {
    id: 'c_eng',
    name: '兒童實用美語',
    category: 'english',
    description: '外師全美語互動教學',
  },
];

export const mockClasses: Class[] = [
  {
    id: 'cl_001',
    courseId: 'c_math',
    className: '2026秋季 國二數學特訓A班',
    teacherName: '張天才',
    classroom: '201大教室',
    dayOfWeek: 2,
    startTime: '18:30',
    endTime: '21:30',
    maxCapacity: 25,
    pricePerPeriod: 600,
  },
  {
    id: 'cl_002',
    courseId: 'c_eng',
    className: '2026秋季 小六美語衝刺班',
    teacherName: 'David Lee',
    classroom: '102語言教室',
    dayOfWeek: 4,
    startTime: '17:00',
    endTime: '19:00',
    maxCapacity: 15,
    pricePerPeriod: 800,
  },
];

export const mockEnrollments: Enrollment[] = [
  {
    id: 'e_001',
    studentId: 's_001',
    classId: 'cl_001',
    enrolledAt: '2026-08-01',
    paymentStatus: 'paid',
    remainingLessons: 20,
  },
  {
    id: 'e_002',
    studentId: 's_002',
    classId: 'cl_002',
    enrolledAt: '2026-08-05',
    paymentStatus: 'partial',
    remainingLessons: 10,
  },
];
```
# ✅ Acceptance Criteria
Both files must be generated without syntax or type errors.

Run npm run build or npx tsc to verify TypeScript type-checking passes.