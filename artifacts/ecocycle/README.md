# EcoCycle — Phase 1

EcoCycle connects households with recycling collectors and recycling partners.
This milestone includes the public landing page, registration and login, a
cookie-authenticated profile page, the Express API, MongoDB persistence, and a
secure first-admin seed command.

## Workspace layout

- `artifacts/ecocycle/` — React + Vite frontend
- `artifacts/api-server/` — Express API, MongoDB models, auth middleware, and seed script
- `lib/api-spec/openapi.yaml` — API contract and generated client source

The workspace is managed with pnpm. Run package commands from the workspace
root unless noted otherwise.

## Configure MongoDB and secrets

1. Create a MongoDB Atlas cluster and database named `ecocycle`.
2. Create a database user with access only to that database, and allow network
   access from the environment where the API will run.
   Replit development egress IPs can change, and published apps do not have
   fixed outbound IPs. For production Atlas allowlisting, route through a
   static-IP proxy rather than assuming a development IP will remain valid.
3. Copy `artifacts/api-server/.env.example` to
   `artifacts/api-server/.env` for local development, then set `MONGODB_URI`
   and a unique random `JWT_SECRET`. Never commit `.env`.
4. In Replit, add `MONGODB_URI` and `JWT_SECRET` in the project's Secrets
   settings. The API reads them from the server environment.
5. Set `CLIENT_ORIGIN` to the frontend origin if running the frontend and API
   on separate local ports. Replit preview serves both under the same origin.
6. Optionally set `VITE_SUPPORT_EMAIL` in the frontend environment to show a
   public support contact in the footer.

The server refuses to start if either required secret is missing or the MongoDB
connection cannot be established.

## Run in Replit

The managed API and web workflows start the application with the correct ports
and preview routing. Add the two required secrets above, then open the EcoCycle
preview.

## Run locally

From the workspace root, install dependencies:

```sh
pnpm install
```

Copy and fill in `artifacts/api-server/.env.example` as
`artifacts/api-server/.env`. In one terminal, start the API:

```sh
pnpm --filter @workspace/api-server run dev
```

In another terminal, copy `artifacts/ecocycle/.env.example` to
`artifacts/ecocycle/.env`, then start the frontend:

```sh
pnpm --filter @workspace/ecocycle run dev
```

The local frontend uses `VITE_API_BASE_URL=http://localhost:5000`; the API's
`CLIENT_ORIGIN` should be `http://localhost:5173`. Vite's local dev server
selects its port from the environment; when needed, run it with
`PORT=5173 BASE_PATH=/ pnpm --filter @workspace/ecocycle run dev`.

## Create the first administrator

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and optionally
`ADMIN_NAME` in the API environment, then run:

```sh
pnpm --filter @workspace/api-server run seed:admin
```

The seed script refuses to change an existing account's role. Public
registration only permits `user`, `collector`, and `recycler`.

## Phase 1 checks

- Register at `/register` using a user, collector, or recycler role.
- Confirm sign-in and role details at `/account`.
- Edit the profile, sign out, then sign back in at `/login`.
- The API health check is `GET /api/healthz`.

## Authentication API

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create a non-admin account and sign in |
| `POST` | `/api/auth/login` | Public | Sign in |
| `GET` | `/api/auth/me` | Signed in | Return the current account |
| `PATCH` | `/api/auth/profile` | Signed in | Update name, phone, or address |
| `POST` | `/api/auth/logout` | Public/idempotent | Clear the session cookie |

Sessions use a seven-day, HTTP-only, same-site cookie. Passwords are hashed
with bcrypt and are never included in API responses.
