# AI Website Builder — Server

Backend API for the Full-Stack AI Website Builder. Built with **Express 5**, **TypeScript**, **Prisma** (PostgreSQL), **Better Auth**, **OpenAI**, and **Stripe**.

## Tech Stack

- **Runtime:** Node.js + [tsx](https://github.com/privatenumber/tsx) (run TypeScript directly)
- **Framework:** Express 5
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Better Auth (email/password + sessions)
- **AI:** OpenAI-compatible API (used to generate website code)
- **Payments:** Stripe (credit purchases + webhook)

## Prerequisites

- Node.js 18+ (20+ recommended)
- A PostgreSQL database (version 15+). A hosted provider such as [Neon](https://neon.tech) works well.
- A Stripe account (for payments) and an OpenAI-compatible API key.

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

   > `postinstall` runs `prisma generate` automatically.

2. **Configure environment variables**

   Copy the example file and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   Required variables:

   | Variable                | Description                                                        |
   | ----------------------- | ------------------------------------------------------------------ |
   | `DATABASE_URL`          | PostgreSQL connection string (requires PostgreSQL >= 15).          |
   | `TRUSTED_ORIGINS`       | Comma-separated list of allowed CORS origins (e.g. the client URL). |
   | `BETTER_AUTH_SECRET`    | Secret used to sign auth tokens/sessions.                          |
   | `BETTER_AUTH_URL`       | Public URL of this server (e.g. `http://localhost:3000`).          |
   | `NODE_ENV`              | `development` or `production`.                                     |
   | `AI_API_KEY`            | API key for the OpenAI-compatible model used to generate sites.    |
   | `STRIPE_SECRET_KEY`     | Stripe secret key for creating checkout sessions.                  |
   | `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret.                                     |
   | `PORT`                  | (Optional) Port to listen on. Defaults to `3000`.                  |

3. **Set up the database**

   ```bash
   npm run db:migrate    # apply migrations
   npm run db:generate   # regenerate the Prisma client (if needed)
   npm run db:studio     # optional: open Prisma Studio to inspect data
   ```

4. **Run the server**

   ```bash
   npm run dev     # watch mode with nodemon + tsx
   # or
   npm start       # single run
   ```

   The server starts at `http://localhost:3000` and responds `Server is Live!` at `/`.

## API Overview

All authenticated routes require a valid Better Auth session (the `protect` middleware).

### Auth (`/api/auth/*`)

Handled by Better Auth (sign-up, sign-in, sessions, email verification, etc.).

### User (`/api/user`)

| Method | Endpoint                         | Auth | Description                        |
| ------ | -------------------------------- | ---- | ---------------------------------- |
| GET    | `/credits`                       | ✅   | Get the current user's credits.    |
| POST   | `/project`                       | ✅   | Create a new website project.      |
| GET    | `/project/:projectId`            | ✅   | Get one of the user's projects.    |
| GET    | `/projects`                      | ✅   | List the user's projects.          |
| POST   | `/purchase-credits`              | ✅   | Start a Stripe credit purchase.    |
| GET    | `/toggle-publish/:projectId`     | ✅   | Publish/unpublish a project.       |

### Project (`/api/project`)

| Method | Endpoint                              | Auth | Description                            |
| ------ | ------------------------------------- | ---- | -------------------------------------- |
| GET    | `/published`                          | ❌   | List all published projects.           |
| GET    | `/published/:projectId`               | ❌   | Get a published project by id.         |
| GET    | `/preview/:projectId`                 | ✅   | Get a project for preview.             |
| POST   | `/revision/:projectId`                | ✅   | Make an AI revision to a project.      |
| PUT    | `/save/:projectId`                    | ✅   | Save project code.                     |
| GET    | `/rollback/:projectId/:versionId`     | ✅   | Roll back to a previous version.       |
| DELETE | `/:projectId`                         | ✅   | Delete a project.                      |

### Stripe (`/api/stripe`)

| Method | Endpoint       | Description                                              |
| ------ | -------------- | ------------------------------------------------------- |
| POST   | `/api/stripe`  | Stripe webhook (raw body). Handles payment completion.  |

## Data Model (Prisma)

Key models: `User`, `WebsiteProject`, `Conversation`, `Version`, `Transaction`, plus Better Auth's `Session`, `Account`, and `Verification`. See [`prisma/schema.prisma`](./prisma/schema.prisma) for the full schema.

## Project Structure

```
server/
├── server.ts            # App entry point
├── configs/             # OpenAI client config
├── controllers/         # Route handlers (user, project, stripe webhook)
├── routes/              # Express routers
├── middleware/          # Auth (protect) middleware
├── lib/                 # Better Auth + Prisma client setup
├── prisma/              # Schema + migrations
└── types/               # TypeScript type augmentation
```

## Security Notes

- **Never commit `.env`.** It is git-ignored. Only `.env.example` (with placeholders) is tracked.
- Rotate any secret that may have been exposed locally before making the repository public.
