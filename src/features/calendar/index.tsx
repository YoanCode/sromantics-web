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
import { useAttendanceQuery } from '@/features/attendance/queries'
import { useMakeUpCreditsQuery } from '@/features/make-up-credits/queries'
import type { Attendance, Class, Enrollment, Student } from '@/types/mds'
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

type CalendarParticipant = {
  enrollment: Enrollment
  student: Student
}

type CalendarMakeUpParticipant = {
  date: string
  student: Student
}

type CalendarEventProps =
  | { kind: 'class'; classItem: Class; participants: CalendarParticipant[]; makeUpParticipants: CalendarMakeUpParticipant[] }
  | { kind: 'absence'; classItem: Class; student: Student }
  | { kind: 'makeup'; classItem: Class; student: Student }

function isEnrollmentValidOnDate(enrollment: Enrollment, dateKey: string) {
  return (
    enrollment.status !== 'cancelled' &&
    enrollment.startedAt <= dateKey &&
    (!enrollment.endedAt || enrollment.endedAt >= dateKey)
  )
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getParticipantsOnDate(
  participants: CalendarParticipant[],
  date: Date | null
) {
  if (!date) return []
  const dateKey = getDateKey(date)
  const uniqueStudents = new Map<string, Student>()

  participants
    .filter(({ enrollment }) => isEnrollmentValidOnDate(enrollment, dateKey))
    .forEach(({ student }) => uniqueStudents.set(student.id, student))

  return [...uniqueStudents.values()]
}

function toEvent(
  classItem: Class,
  courseName: string,
  participants: CalendarParticipant[],
  makeUpParticipants: Student[]
) {
  return {
    id: classItem.id,
    title: classItem.className,
    daysOfWeek: [classItem.dayOfWeek % 7],
    startTime: classItem.startTime,
    endTime: classItem.endTime,
    backgroundColor: classItem.courseId === 'c_math' ? '#0f766e' : '#1d4ed8',
    borderColor: 'transparent',
    extendedProps: {
      kind: 'class',
      classItem,
      courseName,
      participants,
      makeUpParticipants,
    },
  }
}

function toAbsenceEvent(attendance: Attendance, classItem: Class, student: Student) {
  return {
    id: `absence-${attendance.id}`,
    title: `Absent: ${student.name}`,
    start: `${attendance.attendanceDate}T${classItem.startTime}`,
    end: `${attendance.attendanceDate}T${classItem.endTime}`,
    backgroundColor: '#b91c1c',
    borderColor: '#991b1b',
    extendedProps: {
      kind: 'absence' as const,
      classItem,
      student,
    },
  }
}

function toMakeUpEvent(credit: { id: string; targetDate?: string }, classItem: Class, student: Student) {
  return {
    id: `makeup-${credit.id}`,
    title: `Make-up: ${student.name}`,
    start: `${credit.targetDate}T${classItem.startTime}`,
    end: `${credit.targetDate}T${classItem.endTime}`,
    backgroundColor: '#c2410c',
    borderColor: '#9a3412',
    extendedProps: {
      kind: 'makeup' as const,
      classItem,
      student,
    },
  }
}

function renderEventContent(eventInfo: {
  event: {
    title: string
    start: Date | null
    extendedProps: CalendarEventProps
  }
}) {
  const eventProps = eventInfo.event.extendedProps
  if (eventProps.kind === 'absence' || eventProps.kind === 'makeup') {
    return (
      <div className='calendar-event-content'>
        <strong>{eventInfo.event.title}</strong>
        <span>{eventProps.classItem.classroom}</span>
      </div>
    )
  }

  const classItem = eventProps.classItem
  const participants = getParticipantsOnDate(
    eventProps.participants,
    eventInfo.event.start
  )
  const dateKey = eventInfo.event.start ? getDateKey(eventInfo.event.start) : ''
  const allParticipants = new Map(
    [
      ...participants,
      ...eventProps.makeUpParticipants
        .filter((participant) => participant.date === dateKey)
        .map((participant) => participant.student),
    ].map((student) => [student.id, student])
  )
  const studentCount = allParticipants.size
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
  const { data: attendances = [], isLoading: attendancesLoading } = useAttendanceQuery()
  const { data: makeUpCredits = [], isLoading: makeUpCreditsLoading } = useMakeUpCreditsQuery()
  const [selectedClass, setSelectedClass] = useState<Class>()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const enrollmentParticipantsByClass = useMemo(() => {
    const studentById = new Map(students.map((student) => [student.id, student]))
    const studentCourseById = new Map(studentCourses.map((item) => [item.id, item]))
    const result = new Map<string, CalendarParticipant[]>()

    enrollments
      .forEach((enrollment) => {
        const studentCourse = studentCourseById.get(enrollment.studentCourseId)
        const student = studentCourse
          ? studentById.get(studentCourse.studentId)
          : undefined
        if (!student) return
        result.set(enrollment.classId, [
          ...(result.get(enrollment.classId) ?? []),
          { enrollment, student },
        ])
      })

    return result
  }, [enrollments, studentCourses, students])

  const events = useMemo(
    () => {
      const studentById = new Map(students.map((student) => [student.id, student]))
      const studentCourseById = new Map(studentCourses.map((item) => [item.id, item]))
      const classById = new Map(classes.map((classItem) => [classItem.id, classItem]))
      const classEvents = classes.map((classItem) => {
        const courseName =
          courses.find((course) => course.id === classItem.courseId)?.name ??
          'Unknown course'
        return toEvent(
          classItem,
          courseName,
          enrollmentParticipantsByClass.get(classItem.id) ?? [],
          makeUpCredits
            .filter((credit) => credit.status === 'scheduled' && credit.targetClassId === classItem.id)
            .flatMap((credit) => {
              const sourceEnrollment = enrollments.find((item) => item.id === credit.sourceEnrollmentId)
              const studentCourse = sourceEnrollment
                ? studentCourseById.get(sourceEnrollment.studentCourseId)
                : undefined
              const student = studentCourse ? studentById.get(studentCourse.studentId) : undefined
              return student && credit.targetDate
                ? [{ date: credit.targetDate, student }]
                : []
            })
        )
      })
      const absenceEvents = attendances.flatMap((attendance) => {
        if (attendance.status !== 'absent') return []
        const enrollment = enrollments.find((item) => item.id === attendance.enrollmentId)
        const studentCourse = enrollment
          ? studentCourseById.get(enrollment.studentCourseId)
          : undefined
        const student = studentCourse ? studentById.get(studentCourse.studentId) : undefined
        const classItem = classById.get(attendance.classId)
        return student && classItem ? [toAbsenceEvent(attendance, classItem, student)] : []
      })
      const makeUpEvents = makeUpCredits.flatMap((credit) => {
        if (credit.status !== 'scheduled' || !credit.targetDate || !credit.targetClassId) return []
        const sourceEnrollment = enrollments.find((item) => item.id === credit.sourceEnrollmentId)
        const studentCourse = sourceEnrollment
          ? studentCourseById.get(sourceEnrollment.studentCourseId)
          : undefined
        const student = studentCourse ? studentById.get(studentCourse.studentId) : undefined
        const classItem = classById.get(credit.targetClassId)
        return student && classItem ? [toMakeUpEvent(credit, classItem, student)] : []
      })
      return [...classEvents, ...absenceEvents, ...makeUpEvents]
    },
    [attendances, classes, courses, enrollmentParticipantsByClass, enrollments, makeUpCredits, studentCourses, students]
  )

  const initialCalendarDate = useMemo(() => {
    const scheduledDates = makeUpCredits
      .filter((credit) => credit.status === 'scheduled' && credit.targetDate)
      .map((credit) => credit.targetDate as string)
      .sort()
    return scheduledDates[0]
  }, [makeUpCredits])

  const handleEventClick = (event: EventClickArg) => {
    const classItem = event.event.extendedProps.classItem as Class | undefined
    if (!classItem) return
    setSelectedClass(classItem)
    setSelectedDate(event.event.start)
  }

  const selectedStudents = selectedClass
    ? getParticipantsOnDate(
        enrollmentParticipantsByClass.get(selectedClass.id) ?? [],
        selectedDate
      )
    : []

  const selectedMakeUpStudents = selectedClass && selectedDate
    ? makeUpCredits
        .filter((credit) =>
          credit.status === 'scheduled' &&
          credit.targetClassId === selectedClass.id &&
          credit.targetDate === getDateKey(selectedDate)
        )
        .map((credit) => {
          const enrollment = enrollments.find((item) => item.id === credit.sourceEnrollmentId)
          const studentCourse = studentCourses.find((item) => item.id === enrollment?.studentCourseId)
          return students.find((student) => student.id === studentCourse?.studentId)
        })
        .filter((student): student is Student => Boolean(student))
    : []

  const selectedAbsentStudents = selectedClass && selectedDate
    ? attendances
        .filter((attendance) =>
          attendance.status === 'absent' &&
          attendance.classId === selectedClass.id &&
          attendance.attendanceDate === getDateKey(selectedDate)
        )
        .map((attendance) => {
          const enrollment = enrollments.find((item) => item.id === attendance.enrollmentId)
          const studentCourse = studentCourses.find((item) => item.id === enrollment?.studentCourseId)
          return students.find((student) => student.id === studentCourse?.studentId)
        })
        .filter((student): student is Student => Boolean(student))
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
              {classesLoading || coursesLoading || studentsLoading || studentCoursesLoading || enrollmentsLoading || attendancesLoading || makeUpCreditsLoading ? (
                <p className='py-12 text-center text-muted-foreground'>Loading schedule...</p>
              ) : (
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView='timeGridWeek'
                  initialDate={initialCalendarDate}
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
                        {selectedAbsentStudents.length > 0 && (
                          <div className='mt-3'>
                            <p className='font-medium text-red-700'>Absent students</p>
                            <ul className='mt-1 list-inside list-disc text-red-700'>
                              {selectedAbsentStudents.map((student) => (
                                <li key={student.id}>{student.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedMakeUpStudents.length > 0 && (
                          <div className='mt-3'>
                            <p className='font-medium text-orange-700'>Make-up students</p>
                            <ul className='mt-1 list-inside list-disc text-orange-700'>
                              {selectedMakeUpStudents.map((student) => (
                                <li key={student.id}>{student.name}</li>
                              ))}
                            </ul>
                          </div>
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
