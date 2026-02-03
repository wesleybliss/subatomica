# Subatomica

A modern web application built with Next.js 16, React 19, and Drizzle ORM.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Base UI](https://base-ui.com/)
- **Database:** [Drizzle ORM](https://orm.drizzle.team/) (Supports Turso & PostgreSQL)
- **Authentication:** [Better Auth](https://www.better-auth.com/)
- **State Management:** React Wire
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- [pnpm](https://pnpm.io/) (Package manager)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd subatomica
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Environment Setup:
    Create a `.env` file in the root directory (copy from `.env.example` if available) and configure your database and auth credentials.

    Required variables (example):
    ```env
    DATABASE_URL="libsql://..." # or postgres://...
    DATABASE_DIALECT="turso" # or "postgres"
    TURSO_AUTH_TOKEN="..." # if using Turso
    BETTER_AUTH_SECRET="..."
    BETTER_AUTH_URL="http://localhost:3000"
    ```

4.  Push Database Schema:
    ```bash
    pnpm db:push
    ```

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm check`: Runs TypeScript type checking.
- `pnpm lint`: Runs ESLint.
- `pnpm lint:fix`: Fixes linting errors automatically.
- `pnpm db:push`: Pushes schema changes to the database.

## Project Structure

```
├── app/                # Next.js App Router pages and layouts
├── components/         # Reusable React components
│   └── ui/             # shadcn/ui components
├── lib/                # Utilities, hooks, and configuration
│   └── db/             # Database schema and client setup
├── store/              # Global state management
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## Learn More

To learn more about the technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) - learn about Drizzle ORM.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.