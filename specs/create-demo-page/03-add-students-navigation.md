# Spec 03: Add Students to Sidebar Navigation

## Goal

Add the existing Students feature to the authenticated application's left sidebar so users can open the Students List page from the main navigation.

This change is navigation-only. The Students route and page already exist in Spec 02 and must not be reimplemented here.

## Naming and Location

This specification follows the existing naming convention in `specs/create-demo-page`:

- Two-digit sequence number.
- Lowercase kebab-case filename.
- Markdown extension.

File name: `03-add-students-navigation.md`

## Existing Architecture

The sidebar is data-driven:

```text
src/components/layout/data/sidebar-data.ts
  -> sidebarData.navGroups
  -> src/components/layout/app-sidebar.tsx
  -> NavGroup
  -> sidebar link
```

`AppSidebar` already maps `sidebarData.navGroups` to `NavGroup` components. Do not add a separate hard-coded link in `app-sidebar.tsx`.

The Students route already exists at:

```text
src/routes/_authenticated/students/index.tsx
```

Because `_authenticated` is a pathless layout segment, the public URL is:

```text
/students
```

The Students page is implemented by:

```text
src/features/students/index.tsx
```

## Required Change

Update:

```text
src/components/layout/data/sidebar-data.ts
```

### Import the icon

Add `GraduationCap` to the existing `lucide-react` import.

Use an existing icon library component instead of creating a custom SVG icon.

### Add the navigation item

Add the following item to the `General` navigation group's `items` array, preferably after `Users`:

```tsx
{
  title: 'Students',
  url: '/students',
  icon: GraduationCap,
},
```

The item must be a direct `NavLink`, not a collapsible item with nested children, because the Students feature currently exposes one page.

## Functional Requirements

- The left sidebar displays a `Students` item under the `General` group.
- The item displays the `GraduationCap` icon.
- Selecting the item navigates to `/students`.
- The authenticated layout remains active after navigation.
- The Students List page renders without changing its existing table, dialogs, or mock-data behavior.
- The active navigation state is handled by the existing `NavGroup` implementation.
- The sidebar remains usable when collapsed and on mobile.
- No duplicate Students item is added to another navigation group.

## Non-Requirements

Do not change:

- `src/routes/_authenticated/students/index.tsx`
- `src/features/students/index.tsx`
- Students table, dialogs, provider, or data model files
- `src/components/layout/app-sidebar.tsx`
- Authentication or authorization behavior
- Backend persistence

## Implementation Steps

1. Open `src/components/layout/data/sidebar-data.ts`.
2. Add `GraduationCap` to the `lucide-react` imports.
3. Add the Students `NavLink` to the `General` group.
4. Run formatting and validation commands.
5. Manually verify the sidebar link in desktop, collapsed, and mobile layouts when possible.

## Validation

Run from the project root:

```bash
npm exec prettier -- --check src/components/layout/data/sidebar-data.ts
npm run lint
npm run build
npm test
```

For a browser smoke test:

1. Start the development server with `npm run dev`.
2. Open the authenticated application.
3. Confirm `Students` appears in the left sidebar.
4. Click `Students`.
5. Confirm the URL is `/students` and the Students List page is visible.
6. Refresh the page and confirm the route still loads.

## Acceptance Criteria

- [ ] `GraduationCap` is imported from `lucide-react`.
- [ ] `Students` appears once in the `General` navigation group.
- [ ] The item points to `/students`.
- [ ] The item is a direct link and not a nested menu.
- [ ] Existing `AppSidebar` and `NavGroup` components are reused.
- [ ] Active-link styling works through the existing navigation implementation.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Tests pass or any unrelated existing failure is documented.

## Suggested Commit Message

```text
feat(navigation): add students page to sidebar

- Add Students link to the General navigation group
- Use the GraduationCap Lucide icon
- Connect the sidebar item to the existing /students route
```
