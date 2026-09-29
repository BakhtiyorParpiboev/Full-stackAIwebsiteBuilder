# Full-Stack AI Website Builder

An AI-powered web application that generates, edits, previews, versions, and publishes websites from natural-language prompts. Users describe the site they want, the AI generates the code, and they can revise it, roll back to earlier versions, publish it to a community gallery, and purchase credits through Stripe.

This repository is a monorepo containing two applications:

| Directory              | Application | Stack                                                                            |
| ---------------------- | ----------- | -------------------------------------------------------------------------------- |
| [`client/`](./client)  | Frontend    | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack, Better Auth UI |
| [`server/`](./server)  | Backend     | Express 5, TypeScript, Prisma (PostgreSQL), Better Auth, OpenAI, Stripe          |

## Features

- AI website generation from natural-language prompts
- Iterative AI revisions to refine generated sites
- Version history with rollback to any previous version
- Live preview of generated websites
- Community gallery for publishing and browsing public projects
- Authentication with email/password and sessions via Better Auth
- Credit system with Stripe checkout for payments
- Persistent storage using PostgreSQL and Prisma

## Architecture

```
Client (React + Vite)            Server (Express + Prisma)
      port 5173                         port 3000
          |                                 |
          |  ------- HTTP / REST -------->   |
          |  <------------------------------ |
                                             |
                     -------------------------------------------------
                     |                       |                       |
                 PostgreSQL              OpenAI API               Stripe API
                (via Prisma)          (code generation)          (payments)
```

## Prerequisites

- Node.js 18 or later (20+ recommended)
- PostgreSQL 15 or later (a hosted provider such as Neon works well)
- An OpenAI-compatible API key for AI generation
- A Stripe account for payments

## Quick Start

Clone the repository, then set up each application.

### Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env      # fill in your values (database, auth, AI, Stripe)
npm run db:migrate        # apply the database schema
npm run dev               # starts on http://localhost:3000
```

### Frontend (`client/`)

```bash
cd client
npm install
cp .env.example .env      # set VITE_BASE_URL to your server URL
npm run dev               # starts on http://localhost:5173
```

Open http://localhost:5173, create an account, and begin building.

For detailed setup, environment variables, scripts, and the full API reference, see
[`client/README.md`](./client/README.md) and [`server/README.md`](./server/README.md).

## Environment Variables

### Server (`server/.env`)

| Variable                | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string (PostgreSQL >= 15).   |
| `TRUSTED_ORIGINS`       | Comma-separated list of allowed CORS origins.      |
| `BETTER_AUTH_SECRET`    | Secret used to sign auth tokens and sessions.      |
| `BETTER_AUTH_URL`       | Public URL of the server.                          |
| `NODE_ENV`              | `development` or `production`.                     |
| `AI_API_KEY`            | Key for the OpenAI-compatible model.               |
| `STRIPE_SECRET_KEY`     | Stripe secret key.                                 |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret.                     |
| `PORT`                  | Optional server port. Defaults to `3000`.          |

### Client (`client/.env`)

| Variable        | Description                          | Example                 |
| --------------- | ------------------------------------ | ----------------------- |
| `VITE_BASE_URL` | Base URL of the backend API server.  | `http://localhost:3000` |

## API Overview

Authenticated routes require a valid Better Auth session.

- Auth: `/api/auth/*` (sign-up, sign-in, sessions, email verification)
- User: `/api/user/*` (credits, projects, purchase credits, publish toggle)
- Project: `/api/project/*` (published list, preview, AI revision, save, rollback, delete)
- Stripe: `POST /api/stripe` (webhook)

Complete endpoint tables are available in [`server/README.md`](./server/README.md).

## Repository Structure

```
Full-stackAIwebsiteBuilder/
├── client/            # React + Vite frontend
│   ├── src/           # pages, components, lib, configs
│   └── README.md
├── server/            # Express + Prisma backend
│   ├── controllers/   # route handlers
│   ├── routes/        # Express routers
│   ├── lib/           # auth and prisma setup
│   ├── prisma/        # schema and migrations
│   └── README.md
└── README.md
```

## Security

- Do not commit `.env` files. They are git-ignored; only `.env.example` files with placeholder values are tracked.
- Client variables prefixed with `VITE_` are embedded in the browser bundle and are publicly visible. Never store secrets in them.
- If any secret may have been exposed locally, rotate it (Stripe keys, AI API key, database password, and auth secret) before publishing the repository.

## License

This project is provided as-is. Add a `LICENSE` file to define usage terms.
