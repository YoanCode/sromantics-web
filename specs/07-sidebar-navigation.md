# Spec 07: MDS Sidebar Navigation

## Goal

Keep the authenticated sidebar focused on the cram school management workflow while preserving the template pages and routes for future use.

## Visible navigation

The sidebar must show:

- Dashboard
- Students
- Parents
- Courses
- Classes
- Student Courses
- Enrollments
- Settings

## Hidden navigation

The following items remain implemented but are hidden from the sidebar because they are template/demo or secondary pages:

- Tasks
- Apps
- Chats
- Users
- Secured by Clerk and its child links
- Auth and Errors page group
- Help Center

Hiding a navigation item must not delete its route, feature, or source file. Direct route access remains unchanged.

## Implementation rules

- Navigation items use `hidden: true` in `sidebar-data.ts`.
- The navigation renderer filters hidden items before rendering.
- A group with no visible items is not rendered.
- Hidden items must not appear in expanded, collapsed, or mobile sidebar modes.

## Acceptance criteria

- The sidebar contains only the visible MDS workflow items listed above.
- `/students`, `/parents`, `/courses`, `/classes`, `/student-courses`, and `/enrollments` remain accessible from the sidebar.
- Existing hidden routes remain available by direct URL.
- The Web TypeScript check and production build pass.
- Existing API-backed management pages continue to load from the running API server.
