# Reservations web

The management interface for shared resources: resources, reservations and
users.

It is a client of the [Reservations API](../test-reservation-backend). All the
business logic lives there; what is solved here is making a booking quick and
making the errors comprehensible.

- **Stack**: Next.js 16 (App Router) · React 19 · MUI 9 · TanStack Query 5 · TypeScript
- **Authentication**: Better Auth, signed session cookie
- **Interface language**: Spanish. The code is in English; everything the user
  reads is in Spanish, and all of it lives in `src/i18n/es.ts`.

---

## Getting started

Docker is the only requirement, plus the API repository cloned alongside this
one.

```bash
make start
```

It checks whether the API is up and starts it if it is not — building its
database and loading its demo data — before bringing up the interface. One
command from nothing.

|         | URL                          |
| ------- | ---------------------------- |
| Web     | http://localhost:3001        |
| API     | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/docs   |

Sign in with `admin@reservas.dev` / `Reservas2026!`. There are two non-admin
accounts, `carlos@reservas.dev` and `marta@reservas.dev`, with the same
password, to see the difference in permissions.

If the backend lives somewhere else:

```bash
make start API_DIR=/path/to/test-reservation-backend
```

### Without `make`

Start the API first — it creates the Docker network this compose file joins —
and then:

```bash
docker compose up -d --build
```

On Windows, `make` installs with `winget install GnuWin32.Make`, with Chocolatey
(`choco install make`), or from WSL.

---

## Commands

`make` with no arguments lists everything. The usual ones:

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `make start`     | Full bootstrap, API included                             |
| `make logs`      | Follow the logs                                          |
| `make test`      | Unit and component tests                                 |
| `make check`     | What CI validates: types, lint and tests                 |
| `make api-types` | Regenerate the types from the backend's OpenAPI document |

---

## Screens

**Login** — email and password. The session travels in a signed, `httpOnly`
cookie rather than a token in `localStorage`, so an XSS cannot read it. The role
arrives in the session itself, which means the interface does not decide who is
an administrator, it only reflects it.

**Resources** — list with create, edit, deactivate and reactivate. A deactivated
resource is still shown, marked as such: nothing with history is deleted.

**Reservations** — list with filters by resource, status and date range, plus
pagination. New bookings are created and existing ones cancelled from here.

**Users** — administrators only: creation with password confirmation, editing,
role changes and banning.

---

## The booking dialog

This is where the interesting decisions concentrate, because it is where the
user meets the no-overlap rule.

**Free slots are offered, not guessed.** Once a resource and a day are chosen,
the interface queries `GET /resources/:id/availability` and shows the free
ranges as clickable chips. Typing a time blind and being told it is taken is a
bad way to book a room.

**The 409 still exists, and should.** Between the query and the submit someone
else can take the same slot; that is what the database constraint is for. What
changes is that it stops being the normal way to discover a slot is taken and
becomes the rare race it should be. When it happens the dialog stays open: it
shows which range clashes and refetches the slots, so the alternatives sit next
to the error.

**Each opening of the dialog generates an `Idempotency-Key`.** One per opening,
not per attempt, which is what turns a double click into a safe retry rather
than two bookings.

**The hours are the resource's, not the browser's.** A Madrid room booked from
Bogotá still means 10:00 in Madrid. The conversion is isolated in
`wallClockToUtc()`, and it is the one thing covered by nine tests, because it is
where this kind of bug slips through unnoticed.

---

## Structure

```
src/
├── app/                     App Router routes
│   ├── (public)/login/      No session
│   └── (dashboard)/         With session: resources, reservations, users
├── features/                One directory per functional area
│   ├── auth/components/
│   ├── reservations/
│   │   ├── api/             HTTP calls for this area
│   │   └── components/      booking-dialog, free-slots, reservations-table
│   ├── resources/
│   ├── users/
│   └── shell/components/    Sidebar, header, user footer
├── lib/
│   ├── api/                 client, errors, types
│   ├── auth-client.ts
│   └── dates.ts             Wall-clock to UTC instant conversion
├── i18n/es.ts               Every visible string, in one place
├── theme/                   MUI theme and fonts
└── middleware.ts            Route protection
```

Two conventions hold up the rest:

**HTTP calls live in `features/*/api`, never in a component.** A component that
calls `fetch` is a component that cannot be tested without a network.

**Every visible string lives in `i18n/es.ts`.** The code is in English; what the
user reads is in Spanish. A loose string inside a component is a string nobody
finds when it has to change.

---

## Server state

TanStack Query owns everything that comes from the API. There is no duplicate
global server state in React: the Query cache _is_ that state.

Keys follow the shape `['resource', ...parameters]`, for example
`['availability', resourceId, date]`. Putting the parameters in the key is what
makes returning to an already-viewed day render from cache instead of refetching,
and what allows precise invalidation: creating a reservation invalidates
`['reservations']` and `['availability']`, and nothing else.

---

## API types

Response types are not written by hand: they are generated from the OpenAPI
document the backend publishes.

```bash
make api-types
```

A change to a server DTO becomes a compile error here rather than an `undefined`
at runtime. That is the difference between finding out at build time and finding
out in production.

---

## Tests

```bash
make test    # Vitest
make check   # types + lint + tests, the same as CI
```

Playwright is installed and `make e2e` exists, but **the end-to-end suite is not
written yet**: today that command runs no tests.

The unit tests focus on the logic that can fail silently: time zone conversion,
range formatting and API error handling. Rendering a button and asserting it
says "Guardar" proves nothing the compiler did not already know.

---

## Supply chain

The same measures as the backend, for the same reasons:

- `ignore-scripts=true` and `min-release-age=7` in `.npmrc`
- Exact versions, no `^` or `~`, and `npm ci` everywhere
- `make audit` for known vulnerabilities and registry signatures
- GitHub Actions pinned by SHA
- Multi-stage production image using Next's `standalone` output, running as an
  unprivileged user

---

## Versioning

Conventional commits validated by commitlint, with `CHANGELOG.md` generated from
them:

```bash
make release
```
