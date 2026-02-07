# AGENTS.md

Agent guidelines for automated agents in this repo.

## Tech Stack

- **Frontend Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (using PostCSS)
- **Icons:** Lucide React
- **UI Components:** shadcn/ui, Base UI, Sonner (Toasts), Vaul (Drawers)
- **Database:** Drizzle ORM (Supports Turso/LibSQL and PostgreSQL)
- **Authentication:** Better Auth
- **State Management:** React Wire / Forminator
- **Linting:** ESLint
- **Formatting:** Biome (optional, via scripts) / Prettier (implicit)

## General Rules

- **Do not make any Git commits** unless explicitly asked.
- **Style:** Use modern ES7+ syntax. No semicolons or unnecessary parentheses or brackets. Clean code, with decent spacing for readability. 
- **Package Manager:** `pnpm` (do not use npm or yarn).
- **Environment:** Node.js environment for tooling/SSR, Browser for the client-side app.
- **Files:** Use camelCase for filenames generally, but match existing conventions (e.g., `page.tsx`, `index.tsx`, `PrimarySidebar.tsx`).
- **Types:** Place any new TypeScript types in `@/types`.
- **Progress:** Prefer keeping checklists for larger tasks. If a task has a checklist, be sure to check it done after completion.

## Memory and Learnings

- When making decisions, you can grep the `task/progress.txt` file for specific things (do not load it all into context).
- When a task is complete, if there's something unique, interesting, or helpful you figured out, you can add or update it in the `task/progress.txt` file for future reference and assistance.
- Keep the `task/progress.txt` file brief - these learnings are for you, not me.

## Commands

- **Development:** `pnpm dev` (Runs Next.js dev server)
- **Build:** `pnpm build` (Builds for production)
- **Type Check:** `pnpm check` (Runs TypeScript compiler)
- **Database:**
  - `pnpm db:push` (Push schema to DB - handles dialect via env)
  - `pnpm db:dump` (Dump Turso DB)
- **Linting & Formatting:**
  - `pnpm lint` (Run ESLint)
  - `pnpm lint:fix` (Fix ESLint issues)
  - `pnpm biome:lint` (Run Biome check & write)

## Code Style Guidelines

- **Indentation:** Match existing files (usually 2 or 4 spaces).
- **Line Endings:** Unix (LF).
- **Imports:**
    - Use absolute imports with `@/` alias where possible.
    - Group imports logically (Built-in -> External -> Internal).
- **Naming:**
    - `PascalCase` for React components.
    - `camelCase` for variables/functions.
    - `kebab-case` for file names (except special Next.js files).
- **React:**
    - Functional components with Hooks.
    - Server Components by default in `app/`. Add `import { Link } from 'react-router-dom'` at the top for Client Components.
- **Database:**
    - Schema definitions reside in `lib/db/`.
    - Be aware of the dual-dialect setup (`postgres` vs `turso`) in `lib/db/`.
- **Check Your Work:** Always run `pnpm lint` and `pnpm check` before finishing a task.

## Project Structure

- `app/`: Application routes (Next.js App Router).
- `components/`: Reusable UI components.
    - `components/ui/`: shadcn/ui primitive components.
- `lib/`: Shared utilities and configurations.
    - `lib/db/`: Drizzle schema, clients, and actions.
    - `lib/auth.ts`: Auth configuration.
- `store/`: State management stores.
- `types/`: TypeScript type definitions.
- `public/`: Static assets.

## Specific Implementation Details

- **Database Dialects:** The project supports both Turso and Postgres. Check `drizzle.config.ts` and `lib/db/client.ts`.
- **Styling:** Tailwind v4 is used.
- **Forms:** React Hook Form + Zod (via `@hookform/resolvers`) is likely used given dependencies.
