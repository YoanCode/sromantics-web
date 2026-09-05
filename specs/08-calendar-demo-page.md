# Spec 08: Class Calendar Demo Page

## Goal

Provide an authenticated calendar view for the cram school schedule using the existing MDS layout, API clients, and Class data model.

## Route and navigation

- Route: `/calendar`
- The page is visible from the authenticated sidebar.
- The page uses the existing `Header`, `Main`, `Search`, theme switch, configuration drawer, and profile controls.

## Calendar behavior

- Use FullCalendar React with month, week, and day views.
- Default to the weekly time-grid view.
- Load class data from `/api/classes` through the existing `useClassesQuery` hook.
- Load course data from `/api/courses` through the existing `useCoursesQuery` hook.
- Load Students, StudentCourses, and Enrollments through the existing query hooks to resolve active class participants.
- Render each `Class` as a recurring weekly event:
  - `dayOfWeek` maps to FullCalendar's Sunday-based `daysOfWeek` value.
  - `startTime` and `endTime` define the event duration.
  - `className` is the event title.
- Clicking an event displays its class name, weekday, time, classroom, and teacher.
- Each event displays the active participant count.
- Clicking an event lists the participating active students in the detail panel.
- Show a loading state while Classes or Courses data is loading.
- Calendar events display both the class name and classroom in the event body.
- The selected class detail panel appears below the calendar at full width; it must not reduce the calendar's horizontal width.

## Design requirements

- Match the existing shadcn-style cards, typography, colors, spacing, and authenticated layout.
- Use the existing CSS variables for borders, foreground, background, primary, muted, and accent colors.
- Keep the calendar horizontally usable on small screens without changing the page shell.
- Do not duplicate Class or Course data in the calendar page.
- Do not duplicate student participation data; resolve it through active `Enrollment -> StudentCourse -> Student` relationships.
- Use a restrained shadcn-style visual treatment: muted solid grid lines, compact controls, subtle event shadows, and a lightly emphasized current day.
- Use a fixed readable calendar height on desktop and stack the toolbar controls on narrow screens.
- Keep the calendar as the primary full-width visual surface, with selected class details presented below it.

## Acceptance criteria

- `/calendar` loads within the authenticated application.
- Existing Class API data appears as recurring weekly events.
- The month, week, and day view controls work.
- Selecting a class shows its details in the adjacent panel.
- TypeScript check and production build pass.
