import type {
  Parent,
  Student,
  Course,
  Class,
  StudentCourse,
  Enrollment,
} from '@/types/mds'

export const mockParents: Parent[] = [
  {
    id: 'p_001',
    name: '王大明',
    phone: '0912345678',
    email: 'daming.wang@example.com',
    relationship: 'father',
  },
]

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
]

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
]

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
]

export const mockStudentCourses: StudentCourse[] = [
  {
    id: 'sc_001',
    studentId: 's_001',
    courseId: 'c_math',
    enrolledAt: '2026-08-01',
    paymentStatus: 'paid',
    purchasedLessons: 20,
    usedLessons: 0,
    remainingLessons: 20,
    status: 'active',
  },
  {
    id: 'sc_002',
    studentId: 's_002',
    courseId: 'c_eng',
    enrolledAt: '2026-08-05',
    paymentStatus: 'partial',
    purchasedLessons: 10,
    usedLessons: 0,
    remainingLessons: 10,
    status: 'active',
  },
]

export const mockEnrollments: Enrollment[] = [
  {
    id: 'e_001',
    studentCourseId: 'sc_001',
    classId: 'cl_001',
    startedAt: '2026-08-01',
    status: 'active',
  },
  {
    id: 'e_002',
    studentCourseId: 'sc_002',
    classId: 'cl_002',
    startedAt: '2026-08-05',
    status: 'active',
  },
]
