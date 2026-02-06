# Routing Strategy Update for Project Views

## Goal
Update the project detail routing to support different views (Kanban, List, Timeline) via the URL, ensuring that the selected view is persisted on page refresh and shared state (like search query) is preserved during view switching.

## Proposed Routes
- `/t/<teamId>/p/<projectId>` -> Kanban view (default)
- `/t/<teamId>/p/<projectId>/board` -> Kanban view
- `/t/<teamId>/p/<projectId>/list` -> List view
- `/t/<teamId>/p/<projectId>/timeline` -> Timeline view

## Implementation Plan

### 1. Introduce Project Layout
Create `app/t/[teamId]/p/[projectId]/layout.tsx` (Server Component) to:
- Fetch project-wide data (`project`, `tasks`, `lanes`, `teamMembers`, `projects`).
- Use a new `ProjectDetailLayoutClient` to wrap the children.

### 2. Create `ProjectDetailLayoutClient`
Create `app/t/[teamId]/p/[projectId]/ProjectDetailLayoutClient.tsx` (Client Component) to:
- Render the `ProjectDetailNavbar`.
- Manage shared state that should persist across views (e.g., `tasksQuery`, `selectedTasks`).
- Provide this state to the views (via props or context).
- Sync the `activeView` with the current route.

### 3. Implement Catch-all View Page
Rename `app/t/[teamId]/p/[projectId]/page.tsx` to `app/t/[teamId]/p/[projectId]/[[...view]]/page.tsx`.
This page will:
- Determine the view from the `view` parameter.
- Render the appropriate view component (`KanbanView`, `ListView`, or `TimelineView`).
- Receive shared state from the layout.

### 4. Update View Components
- Ensure `KanbanView`, `ListView`, and `TimelineView` are compatible with receiving their state/props from the new structure.

### 5. Update `ProjectDetailNavbar`
- Update the `Tabs` component to use routing for navigation.
- Ensure the active tab matches the current URL.

## Advantages of this Approach
- **Persistence:** View is preserved on refresh via the URL.
- **State Preservation:** Shared state like the search query (`tasksQuery`) is preserved when switching views because the `ProjectDetailLayoutClient` remains mounted.
- **Performance:** Data is fetched once in the layout and shared, avoiding redundant fetches when switching views.

## Verification Plan
1. Navigate to a project and switch between views using the tabs.
2. Verify that the URL updates correctly for each view.
3. Refresh the page on each view and verify that the correct view is rendered.
4. Enter a search query in the List view and switch to Kanban; verify the query is preserved (if implemented in shared state).
5. Verify that `/t/<teamId>/p/<projectId>` correctly defaults to the Kanban view.
6. Verify that `/t/<teamId>/p/<projectId>/board` also renders the Kanban view.
7. Verify that task details (e.g., `/t/<teamId>/p/<projectId>/s/<taskId>`) still work correctly.