# Ttrimmy Facility Response

Role-based facilities issue management for a campus environment. Students register and report issues, admins assign work to technicians, technicians complete tasks, and administrators monitor analytics for operational decisions.

## Stack

- Next.js 16 App Router
- PostgreSQL with Sequelize
- Redis pub/sub for notification fan-out with local fallback for development
- WebSockets for live in-app notifications
- Email notifications with SMTP or stream transport fallback

## Implemented Workflow

- Students can self-register and submit issues for plumbing, electrical, broken windows, networking, furniture, and safety concerns.
- admins can triage incoming issues and assign them to technicians.
- Technicians can update assigned tasks and resolve jobs with notes.
- Administrators can review backlog, critical issue volume, resolution time, and category distribution.
- Notifications are persisted in Postgres, published through Redis, pushed through WebSockets, and optionally copied to email.

## Local Setup

1. Copy `.env.example` to `.env.local` and update the values.
2. Ensure PostgreSQL is running and the target database exists.
3. Optionally start Redis if you want multi-process notification fan-out.
4. Install dependencies with `npm install`.
5. Run the app with `npm run dev`.

`npm run dev` now starts the standard Next.js development server.

If you want to run the custom WebSocket-enabled entrypoint locally, use `npm run dev:realtime`.

## Environment Variables

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ttrimmy_facility_response
SESSION_SECRET=replace-this-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional Redis
REDIS_URL=redis://127.0.0.1:6379

# Optional SMTP
SMTP_URL=
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=alerts@ttrimmy.local
```

If Redis is not configured, notifications still work inside a single process through a local event bus. If SMTP is not configured, email sends use Nodemailer stream transport so the app still runs without a mail server.

## Seeded Accounts

These accounts are created automatically on first boot if the database is empty.

- Admin: `admin@ttrimmy.local`
- admin: `admin@ttrimmy.local`
- Technician: `electrician@ttrimmy.local`
- Technician: `plumber@ttrimmy.local`
- Student: `student@ttrimmy.local`

Default password for all seeded accounts:

```text
Password123!
```

## Validation

The current implementation has been validated with:

```bash
npm run lint
npm run build
```
