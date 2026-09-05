import { useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { EventClickArg } from '@fullcalendar/core'
import { CalendarDays, Clock3, MapPin, UserRound, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { useClassesQuery } from '@/features/classes/queries'
import { useCoursesQuery } from '@/features/courses/queries'
import { useEnrollmentsQuery } from '@/features/enrollments/queries'
import { useStudentCoursesQuery } from '@/features/student-courses/queries'
import { useStudentsQuery } from '@/features/students/queries'
import type { Class, Student } from '@/types/mds'
import './calendar.css'

const dayNames: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

function toEvent(classItem: Class, courseName: string, studentCount: number) {
  return {
    id: classItem.id,
    title: classItem.className,
    daysOfWeek: [classItem.dayOfWeek % 7],
    startTime: classItem.startTime,
    endTime: classItem.endTime,
    backgroundColor: classItem.courseId === 'c_math' ? '#0f766e' : '#1d4ed8',
    borderColor: 'transparent',
    extendedProps: {
      classItem,
      courseName,
      studentCount,
    },
  }
}

function renderEventContent(eventInfo: {
  event: { title: string; extendedProps: { classItem: Class; studentCount: number } }
}) {
  const classItem = eventInfo.event.extendedProps.classItem
  const studentCount = eventInfo.event.extendedProps.studentCount
  return (
    <div className='calendar-event-content'>
      <strong>{eventInfo.event.title}</strong>
      <span>{classItem.classroom}</span>
      <span>{studentCount} student{studentCount === 1 ? '' : 's'}</span>
    </div>
  )
}

export function CalendarPage() {
  const { data: classes = [], isLoading: classesLoading } = useClassesQuery()
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery()
  const { data: students = [], isLoading: studentsLoading } = useStudentsQuery()
  const { data: studentCourses = [], isLoading: studentCoursesLoading } = useStudentCoursesQuery()
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollmentsQuery()
  const [selectedClass, setSelectedClass] = useState<Class>()

  const participantsByClass = useMemo(() => {
    const studentById = new Map(students.map((student) => [student.id, student]))
    const studentCourseById = new Map(studentCourses.map((item) => [item.id, item]))
    const result = new Map<string, Student[]>()

    enrollments
      .filter((enrollment) => enrollment.status === 'active')
      .forEach((enrollment) => {
        const studentCourse = studentCourseById.get(enrollment.studentCourseId)
        const student = studentCourse
          ? studentById.get(studentCourse.studentId)
          : undefined
        if (!student) return
        result.set(enrollment.classId, [...(result.get(enrollment.classId) ?? []), student])
      })

    return result
  }, [enrollments, studentCourses, students])

  const events = useMemo(
    () =>
      classes.map((classItem) => {
        const courseName =
          courses.find((course) => course.id === classItem.courseId)?.name ??
          'Unknown course'
        return toEvent(
          classItem,
          courseName,
          participantsByClass.get(classItem.id)?.length ?? 0
        )
      }),
    [classes, courses, participantsByClass]
  )

  const handleEventClick = (event: EventClickArg) => {
    setSelectedClass(event.event.extendedProps.classItem as Class)
  }

  const selectedStudents = selectedClass
    ? participantsByClass.get(selectedClass.id) ?? []
    : []

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <div className='mb-2 flex items-center gap-2 text-sm text-muted-foreground'>
              <CalendarDays className='size-4' />
              Weekly class schedule
            </div>
            <h1 className='text-2xl font-bold tracking-tight'>Class Calendar</h1>
            <p className='text-muted-foreground'>
              Browse fixed class times and inspect each classroom assignment.
            </p>
          </div>
          <Badge variant='secondary'>{classes.length} classes</Badge>
        </div>

        <div className='flex flex-col gap-4'>
          <Card className='min-w-0'>
            <CardContent className='p-3 sm:p-5'>
              {classesLoading || coursesLoading || studentsLoading || studentCoursesLoading || enrollmentsLoading ? (
                <p className='py-12 text-center text-muted-foreground'>Loading schedule...</p>
              ) : (
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView='timeGridWeek'
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                  }}
                  events={events}
                  eventClick={handleEventClick}
                  eventContent={renderEventContent}
                  eventClassNames='calendar-event'
                  allDaySlot={false}
                  slotMinTime='08:00:00'
                  slotMaxTime='22:00:00'
                  slotDuration='00:30:00'
                  height='720px'
                  expandRows
                  nowIndicator
                  dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
                />
              )}
            </CardContent>
          </Card>

          <Card className='min-h-32'>
            <CardHeader>
              <CardTitle className='text-base'>Selected class</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedClass ? (
                <div className='space-y-4'>
                  <div>
                    <p className='font-semibold'>{selectedClass.className}</p>
                    <p className='text-sm text-muted-foreground'>
                      {dayNames[selectedClass.dayOfWeek]}
                    </p>
                  </div>
                  <div className='space-y-3 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Clock3 className='size-4 text-muted-foreground' />
                      {selectedClass.startTime} - {selectedClass.endTime}
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin className='size-4 text-muted-foreground' />
                      {selectedClass.classroom}
                    </div>
                    <div className='flex items-center gap-2'>
                      <UserRound className='size-4 text-muted-foreground' />
                      {selectedClass.teacherName}
                    </div>
                    <div className='flex items-start gap-2'>
                      <Users className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
                      <div>
                        <p className='font-medium'>Participating students</p>
                        {selectedStudents.length > 0 ? (
                          <ul className='mt-1 list-inside list-disc text-muted-foreground'>
                            {selectedStudents.map((student) => (
                              <li key={student.id}>{student.name}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className='text-muted-foreground'>No active students</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  Select a class event to see its details.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
