# PRD: API Security and RBAC Enhancements

## 1. Overview
This document outlines the requirements for strengthening the Role-Based Access Control (RBAC) and security posture of the Sub-Atomica API. The goal is to resolve critical authorization bugs in member management, eliminate code duplication in access checks, and expose missing mutation routes required by the frontend.

## 2. Problem Statement
1.  **Authorization Vulnerabilities:** The `addTeamMember` service lacks requester validation, and `removeTeamMember` contains a logic bug that checks the target's permissions instead of the requester's.
2.  **Missing API Surface:** Several mutation operations (Create/Update/Delete for Projects and Tasks) are implemented in the service layer but not exposed via Hono routes, causing frontend failures.
3.  **Code Duplication:** The logic for determining "accessible teams" is duplicated across multiple service files, increasing maintenance overhead and the risk of inconsistent security enforcement.

## 3. Goals
- Secure all team management operations.
- Ensure 100% of frontend mutation requests are handled by the API.
- Refactor access control into a shared, reusable utility.
- Maintain strict data isolation between teams.

## 4. Functional Requirements

### 4.1. Shared Access Control (DRY)
- **Refactor `getAccessibleTeamIds`:** Move the Drizzle subquery logic into `apps/api/src/services/shared.ts` or a dedicated `auth.ts` service.
- **Service Integration:** Update `projects.ts`, `tasks.ts`, and `teams.ts` to use this shared utility.

### 4.2. Secure Member Management
- **`addTeamMember` Authorization:**
    - Verify that the `requesterId` has `owner` or `admin` roles in the target `teamId`.
    - Validate that the target user exists.
- **`removeTeamMember` Logic Fix:**
    - Distinguish between `requesterId` and `targetUserId`.
    - Allow users to remove themselves (Leave Team).
    - Only allow `owners` or `admins` to remove others.
    - Prevent the removal of the last `owner`.

### 4.3. Expose Mutation Routes
Implement the following routes in the Hono API:

#### Projects (`/teams/:teamId/projects`)
- `POST /`: Create a new project (Validate team membership).
- `PATCH /:projectId`: Rename project (Validate ownership/admin).
- `DELETE /:projectId`: Delete project (Validate ownership).

#### Tasks (`/teams/:teamId/projects/:projectId/tasks`)
- `POST /`: Create task.
- `PATCH /:taskId`: Update task status/order/content.
- `DELETE /:taskId`: Delete task.

#### Teams (`/teams`)
- `POST /`: Create new team.
- `POST /:teamId/members`: Add member.
- `DELETE /:teamId/members/:userId`: Remove member.

## 5. Technical Constraints & Security Patterns
- **Database Layer:** Use Drizzle ORM subqueries for row-level filtering where possible.
- **Middleware:** Continue using the `protectedRoutes` middleware to ensure `c.get('user')` is populated.
- **Validation:** Use `Zod` (or existing schemas) to validate request bodies before passing data to services.
- **Error Handling:** Return `403 Forbidden` for authorization failures and `404 Not Found` for resources that don't exist or aren't accessible (to avoid leaking resource existence).

## 6. Acceptance Criteria
- [ ] `getAccessibleTeamIds` exists in only one location.
- [ ] A non-admin member cannot add another user to a team.
- [ ] A member cannot remove an admin/owner from a team unless they are the owner.
- [ ] All `useMutation` hooks in the web app receive a `200/201` response from the API.
- [ ] Users cannot access projects or tasks for teams they are not part of, even if they know the UUID.

## 7. Implementation Plan
1.  **Phase 1:** Refactor shared access logic.
2.  **Phase 2:** Fix member management service bugs.
3.  **Phase 3:** Register missing Project routes.
4.  **Phase 4:** Register missing Task routes.
5.  **Phase 5:** Implement Member management routes.
