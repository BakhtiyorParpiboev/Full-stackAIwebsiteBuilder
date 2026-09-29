# AI Website Builder — Client

Frontend for the Full-Stack AI Website Builder. Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **shadcn/ui**, **Better Auth UI**, and **TanStack Query/Form**.

## Tech Stack

- **Framework:** React 19 + Vite 8
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + `tw-animate-css`
- **UI components:** shadcn/ui + Base UI, `lucide-react` icons
- **Routing:** React Router v7
- **Data/Forms:** TanStack Query, TanStack Form
- **Auth:** Better Auth UI (`@better-auth-ui/react`)
- **HTTP:** Axios
- **Linting:** Oxlint

## Prerequisites

- Node.js 18+ (20+ recommended)
- The backend server running (see [`../server/README.md`](../server/README.md))

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy the example file and point it at your backend:

   ```bash
   cp .env.example .env
   ```

   | Variable        | Description                              | Example                 |
   | --------------- | ---------------------------------------- | ----------------------- |
   | `VITE_BASE_URL` | Base URL of the backend API server.      | `http://localhost:3000` |

   > Make sure this URL is included in the server's `TRUSTED_ORIGINS`.

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173` by default.

## Available Scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server (HMR).             |
| `npm run build`   | Type-check (`tsc -b`) and build for production. |
| `npm run preview` | Preview the production build locally.        |
| `npm run lint`    | Run Oxlint.                                  |

## Routes

| Path                                | Page          | Description                          |
| ----------------------------------- | ------------- | ------------------------------------ |
| `/`, `/dashboard`                   | Home          | Landing / prompt to build a site.    |
| `/pricing`                          | Pricing       | Credit plans (Stripe checkout).      |
| `/projects`                         | My Projects   | The current user's projects.         |
| `/projects/:projectId`              | Projects      | Editor/workspace for a project.      |
| `/preview/:projectId[/:versionId]`  | Preview       | Preview a generated site/version.    |
| `/community`                        | Community     | Browse published projects.           |
| `/view/:projectId`                  | View          | View a published project.            |
| `/auth`, `/auth/:pathname`          | Auth          | Sign in / sign up / reset password.  |
| `/settings/account`                 | Settings      | Account settings.                    |
| `/settings/security`                | Security      | Security settings.                   |

## How to Use the App

1. Start the backend server and this client.
2. Open `http://localhost:5173` and **sign up / sign in**.
3. New users start with credits. On the **Home** page, enter a prompt describing the website you want; the AI generates the site code.
4. Open a project to **preview**, request **AI revisions**, **save** edits, or **roll back** to an earlier version.
5. **Publish** a project to share it on the Community page.
6. Buy more credits from the **Pricing** page (Stripe checkout) when you run low.

## Project Structure

```
client/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx           # App bootstrap
│   ├── App.tsx            # Routes + AuthProvider
│   ├── pages/             # Route pages (Home, Pricing, Projects, ...)
│   ├── components/        # UI + auth components (shadcn/ui in components/ui)
│   ├── configs/           # Axios instance
│   ├── lib/               # Auth client + utils
│   ├── assets/            # Images / static assets
│   └── types/             # Shared TypeScript types
└── public/                # Static public files
```

## Security Notes

- **Never commit `.env`.** It is git-ignored; only `.env.example` (with placeholders) is tracked.
- `VITE_`-prefixed variables are embedded into the client bundle and are publicly visible — never put secrets there.
