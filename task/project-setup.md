# Project: Sub Atomica

> Modern, clean, minimal project management.

## Role: Senior Full-Stack Architect & Product Engineer Task: Scaffold a Project Management MVP named "Suba Atomica"

#### **High-Level Architecture:**
- **Folder Structure:** Organize as a standard Next.js project. All TypeScript types must reside in @/types.
- **Database:** Postgres with Drizzle ORM. Use uuid for all primary keys.
- **Routing Structure:** Implement Next.js App Router using the pattern: `/t/:teamId/p/:projectId/s/:taskId`.
- **Theming:** Implement a ThemeProvider supporting Light, Dark, and System modes.

#### Data Schema (Drizzle)
- **Teams:** id, name, ownerId.
- **Projects:** id, teamId, name, description.
- **Tasks:** id, projectId, title, description (HTML string), status (Backlog, Todo, In Progress, Done), priority, dueDate, assigneeId, order (float for Lexicographical sorting in Kanban).
- **Comments:** id, taskId, userId, content.

#### Frontend Specifications
- **Component Library:** Use Shadcn UI patterns but swap Radix primitives for BaseUI. Ensure Tailwind is used for all styling.
- **State Management:** Use TanStack Query (React Query) for server state to handle optimistic updates during drag-and-drop.
- **Views:**
  - **Kanban:** Use @atlaskit/pragmatic-drag-and-drop. Implement columns based on task status.
  - **Timeline:** Integrate a Gantt/Timeline view using abui.io blocks or a similar high-performance SVG-based timeline.
  - **Detail View:** A slide-over or modal for task details including a rich-text editor (use TipTap for HTML output) and an assignment dropdown filtered by team members.

#### LLM-Ready API
- Expose a dedicated /api/v1/bot/ namespace.
- Provide a standard RESTful interface for tasks that accepts an X-API-KEY or uses the existing BetterAuth session.
- Generate an openapi.json file automatically so an LLM can parse the capabilities of the app.

#### Specific Logic
   - **Auth Hook:** On BetterAuth login, check if a user has a team. If not, automatically create a team named "Personal" and set it as the default context.
- **Drag & Drop:** Implement "between-task" dropping logic by calculating the midpoint of the order values to avoid bulk re-indexing of the database.

#### File Storage
- Vercel storage, but can be stubbed for now

#### Permission Levels
- "Teams" implies roles.
- Owner can delete project, and members can edit tasks

#### Extra Info
- Use the best framework for gantt (maybe https://www.abui.io/blocks/timeline)
- Use the best drag & drop framework (maybe @atlaskit/pragmatic-drag-and-drop)
- Theme support for light, dark, and system (auto)
- Derive colors from the provided mockup. You can use some creative liberty, doesn't need to match exactly

---

## Remaining Work Checklist
- [ ] The `TeamsAccountMenu` component should show the current team as the trigger, and show a dropdown with all teams, a divider, and a "create team" option
- [ ] Verify Next.js App Router route structure `/t/:teamId/p/:projectId/s/:taskId`
- [ ] Add ThemeProvider with Light, Dark, System modes. The toggle should appear in the top right corner of the page.
- [x] Define Drizzle schema in `lib/db/` with uuid primary keys for Teams, Projects, Tasks, Comments
- [x] Implement BetterAuth login hook to auto-create Personal team
- [ ] Build Kanban view with @atlaskit/pragmatic-drag-and-drop columns
- [ ] Add midpoint order calculation for between-task drops
- [ ] Implement Timeline/Gantt view (abui.io or equivalent)
- [ ] Create Task Detail modal/slide-over with TipTap editor
- [ ] Add assignee dropdown filtered by team members
- [ ] Set up TanStack Query for optimistic drag-and-drop updates
- [ ] Create /api/v1/bot REST endpoints with X-API-KEY or session auth
- [ ] Auto-generate openapi.json for the bot API
- [ ] Stub Vercel storage integration
- [ ] Add team role permissions (owner delete project, members edit tasks)
