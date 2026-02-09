# PRD: OpenAPI Specification Implementation for Sub-Atomica API

## Overview
This PRD outlines the implementation of automated OpenAPI (Swagger) documentation for the Sub-Atomica API. By leveraging `@hono/zod-openapi`, we will ensure that our API documentation is always in sync with our implementation, providing a single source of truth for both validation and documentation.

## Goals
- **Automated Documentation:** Generate `openapi.json` automatically from route definitions.
- **Interactive UI:** Provide a Swagger UI or Scalar UI for developers to explore and test the API.
- **Type Safety:** Maintain end-to-end type safety by using Zod schemas for both database operations and API validation.
- **Developer Experience:** Simplify the process of adding new routes and documenting them.

## Implementation Strategy

### 1. Base Infrastructure
- **Migrate to `OpenAPIHono`:** Update the base Hono instance to use `OpenAPIHono` instead of the standard `Hono`.
- **Environment Configuration:** Update `createApp` in `src/env.ts` to return an `OpenAPIHono` instance.
- **Documentation Endpoints:** Expose `/doc` (JSON) and `/ui` (Swagger UI) endpoints.

### 2. Schema Generation
- **Drizzle-Zod Integration:** Use `drizzle-zod` to generate base Zod schemas from the database schema.
- **OpenAPI Extensions:** Use `@hono/zod-openapi`'s `z` to extend these schemas with metadata (examples, descriptions, names).
- **Shared Schemas:** Maintain a `src/openapi` directory for shared schemas (e.g., `User`, `Team`, `Error`).

### 3. Route Refactoring
- **`createRoute` Usage:** Replace standard Hono route definitions with `createRoute`.
- **Validation:** Move validation logic from middleware (if any) or manual checks into the route definition's `request` object.
- **Responses:** Explicitly define all possible response codes (200, 201, 400, 401, 404, 500) and their associated schemas.

## Detailed Steps

### Step 1: Core Updates
- Modify `apps/api/src/env.ts` to export `ApiAppEnv` compatible with `OpenAPIHono`.
- Modify `apps/api/src/app.ts` to use `OpenAPIHono`.
- Register the OpenAPI doc and Swagger UI middleware.

### Step 2: Schema Migration
For each major entity (Teams, Projects, Tasks, Lanes):
1. Create a `*.zod.ts` file in `src/openapi/`.
2. Generate base schemas using `createSelectSchema` and `createInsertSchema` from `drizzle-zod`.
3. Wrap or extend these schemas with `.openapi()` metadata.

Example:
```typescript
import { createSelectSchema } from 'drizzle-zod';
import { teams } from '@/db/schema';
import { z } from '@hono/zod-openapi';

export const TeamSchema = createSelectSchema(teams).extend({
  // Override or add fields with openapi metadata
  id: z.string().uuid().openapi({ example: '...' }),
}).openapi('Team');
```

### Step 3: Route Refactoring
Refactor existing routes in `src/routes/*.ts`:
1. Define route configurations using `createRoute`.
2. Register handlers using `app.openapi(route, handler)`.
3. Ensure path parameters, query params, and request bodies are fully typed and documented.

### Step 4: Security Schemes
- Define the `bearerAuth` security scheme for BetterAuth sessions (or cookie-based auth if applicable).
- Apply security requirements to protected routes.

## Examples

### Route Definition
```typescript
const getTeamRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: 'id', in: 'path' }, example: '...' })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: TeamSchema } },
      description: 'The team details'
    },
    404: {
      description: 'Team not found'
    }
  }
});
```

## Acceptance Criteria
- [ ] `/openapi.json` is accessible and returns a valid OpenAPI 3.0.x/3.1.x spec.
- [ ] `/docs` serves an interactive Swagger UI.
- [ ] All existing routes (Teams, Projects, Tasks, Lanes, Health) are documented.
- [ ] Schemas for all major entities are present in the spec.
- [ ] Authentication is correctly documented in the spec.
- [ ] API still functions exactly as before (no regressions in logic).

## References
- [Hono Zod OpenAPI Docs](https://hono.dev/examples/zod-openapi)
- [Drizzle Zod Docs](https://orm.drizzle.team/docs/zod)
