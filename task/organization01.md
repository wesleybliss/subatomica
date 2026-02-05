# Organization Sprint #1

## Overview

Complete all of these tasks.
Follow instructions in `AGENTS.md`.
Use `docs/AGENT_BROWSER.md` if you need to test the actual page.
Do not stop or start the dev server - it is running on `http://localhost:3001`.
Use the credentials below to log in, if needed, and use this URL for testing: `http://localhost:3001/t/019c2712-76d8-705e-93b1-75a694aca6ff`.
Maintain a checklist of tasks & mark them completed at the bottom of this file.

Testing credentials:
```
DEBUG_AGENT_BROWSER_EMAIL="CorporalMaxSterling@gmail.com"
DEBUG_AGENT_BROWSER_PASSWORD="ABCsubatomica123!"
DEBUG_AGENT_BROWSER_TEAM_ID="019c2712-76d8-705e-93b1-75a694aca6ff"
```

## Tasks

### Correct the URL scheme

The current URL scheme shows the kanban board under the team, for example: `http://localhost:3001/t/<teamId>`. Instead, `/t/<teamId>` should just show a very basic page with the team name, number of projects within the team, and number of tasks within the team, as a brief overview.
Similarly, `/t/<teamId>/p` should just show a brief list of projects, `/t/<teamId>/p/<projectId>` should show the actual kanban board with all of the tasks for that project.

### Improve UI for dialogs

Current dialogs are very basic and don't look great. Ensure we're using Shadcn/ui BaseUI dialogs with standard styling based on Shadcn but matching the project design.

## Organize project detail navbar

Currently, `ProjectDetailNavbar.tsx` lives inside the `KanbanView.tsx` component. Move it up a level higher so that it can be shared across all views. I think it should probably live in the `app/t/[teamId]/p/[projectId]/page.tsx` component, but I'm not positive.

## Fix secondary navigation

Currently, the "Views" menu item in the sidebar goes directly to the timeline (gantt chart) view. Remove the sidebar menu item, and instead, put tabs (https://ui.shadcn.com/docs/components/base/tabs) in the `ProjectDetailNavbar.tsx` so I can easily switch between the kanban board (default) and the timeline. Just `useState` for now - it shouldn't navigate to a different URL when toggling between kanban and timeline.

## Fix inconsistent file naming

Some files like `app-sidebar.tsx` should be named proper-case like the rest of the components (e.g. `AppSidebar.tsx`).


## Checklist

- [x] Correct the URL scheme - kanban now at `/t/<teamId>/p/<projectId>`, team overview at `/t/<teamId>`, projects list at `/t/<teamId>/p`
- [x] Improve UI for dialogs - dialogs already using Shadcn/ui BaseUI components
- [x] Organize project detail navbar - moved from KanbanView to page level with view switching
- [x] Fix secondary navigation - removed Views from sidebar, added tabs in ProjectDetailNavbar
- [x] Fix inconsistent file naming - renamed app-sidebar.tsx to AppSidebar.tsx
- [x] Run lint and typecheck - all passing
