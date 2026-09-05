# EuroCars

A car auction platform (Cars & Bids-style) built as a school project for CNAM's GLG204
course. Sellers list vehicles, admins moderate and validate ads, and validated ads can be
launched as live timed auctions with bidding and an automatic "buy now" price.

## Stack

**Frontend**
- Angular 19 (standalone components, signals)
- PrimeNG 19 + Tailwind CSS 4
- ngx-translate (i18n)
- Socket.IO client (live auction updates)

**Backend** — two independent NestJS 11 services
- `euro-auth` — authentication/authorization: registration, login, JWT issuing, token
  revocation via a token-version column
- `euro-platform-api` — the business domain: vehicles, ads, auctions, bids, notifications,
  scheduled auction closing
- TypeORM + PostgreSQL 16, each service owns its own Postgres **schema** (`auth` /
  `public`) and runs its own migrations independently
- Socket.IO (`@nestjs/websockets`) for real-time auction/bid updates
- Google Cloud Storage for ad photo hosting (signed upload URLs)

**Infra**
- Docker Compose: 4 containers — `postgres`, `euro-auth`, `euro-platform-api`,
  `euro-platform-front` (nginx, also acts as the reverse proxy / single entry point)
- nginx serves the built Angular app and proxies `/api/` and `/socket.io/` to
  `euro-platform-api`

## Architecture

```
Browser
  │
  ▼
euro-platform-front (nginx :80)
  ├── /            → Angular static build
  ├── /api/        → euro-platform-api :3000
  └── /socket.io/  → euro-platform-api :3000 (WebSocket upgrade)

euro-platform-api :3000  ──(server-to-server token validation)──►  euro-auth :3000
       │                                                                  │
       └──────────────────────► postgres (schema: public)   (schema: auth) ┘
```

The browser never talks to `euro-auth` directly — `euro-platform-api` proxies
register/login through to it. `euro-platform-api` validates JWTs by calling `euro-auth`
over the network on every protected request rather than verifying signatures locally, so a
revoked token stops working immediately instead of waiting on expiry.

## Repository layout

```
euro-auth/             NestJS auth service
euro-platform-api/     NestJS business-domain service (vehicles, ads, auctions, bids)
euro-platform-front/   Angular SPA
postgres-init/         SQL run once on first Postgres container start (creates the `auth` schema)
docker-compose.yml     4-service container topology
docker-compose.override.yml   local-dev override: runs the frontend via `ng serve` instead of a static build
.env.example           template for the required environment variables
```

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Compose v2)
- Node.js 20+ and npm — only needed if you want to run a service outside Docker (e.g. for
  debugging or running tests)

## Getting started

1. Copy the environment template and fill in your own values:

   ```bash
   cp .env.example .env
   ```

2. Pick a Postgres password and a JWT secret for `.env` (any value works for local dev —
   just don't reuse a real secret). See [Environment variables](#environment-variables)
   below for what's required vs. optional.

3. Build and start everything:

   ```bash
   docker compose up -d --build
   ```

4. Once containers are healthy, the app is available at **http://localhost**.

   Individual services are also exposed directly on the host for debugging:

   | Service              | URL                      |
   |-----------------------|--------------------------|
   | Frontend (nginx)      | http://localhost         |
   | euro-platform-api     | http://localhost:3002    |
   | euro-auth             | http://localhost:3001    |
   | Postgres              | localhost:5432           |

5. Stop everything with:

   ```bash
   docker compose down
   ```

A `docker-compose.override.yml` is picked up automatically alongside `docker-compose.yml`
and switches the frontend container to `ng serve` against a bind-mounted source tree, so
editing a frontend file and refreshing the browser is enough — no rebuild needed. Delete or
ignore it if you want a production-like static-build run of the frontend.

### Running a single service outside Docker

Each Node service can be run standalone against the Dockerized Postgres (or your own local
instance) — useful for debugging or fast iteration:

```bash
cd euro-auth               # or euro-platform-api
npm install
npm run start:dev
```

You'll need the same environment variables the container would get (see
`docker-compose.yml`) available in your shell or a local `.env` — `DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SCHEMA`, plus `JWT_SECRET` for `euro-auth` and
`AUTH_SERVICE_URL` for `euro-platform-api`.

For the frontend:

```bash
cd euro-platform-front
npm install
npm start        # ng serve, http://localhost:4200
```

## Environment variables

Defined in `.env` (copied from `.env.example`, gitignored — never commit real values).

| Variable | Required | Notes |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Yes | Shared Postgres instance credentials |
| `POSTGRES_PORT` | No | Defaults to `5432` |
| `JWT_SECRET` | Yes | Used by `euro-auth` to sign/verify JWTs |
| `CARAPI_API_TOKEN` / `CARAPI_API_SECRET` | No | For [CarAPI](https://carapi.app/) vehicle-data lookups. Currently **not wired in** (dormant code path) — safe to leave blank |
| `GCS_BUCKET_NAME` / `GCS_PROJECT_ID` | Only for photo uploads | Google Cloud Storage bucket used for ad photos. Everything else runs fine without it; ad photo upload will fail until this and the service-account key below are set up |

Ad photo upload also requires a GCS service-account key placed at
`euro-platform-api/secrets/gcs-service-account.json` (gitignored, mounted read-only into the
container). To set this up: create a GCS bucket and a service account with write access to
it in your own Google Cloud project, download its JSON key to that path, and set
`GCS_BUCKET_NAME` / `GCS_PROJECT_ID` accordingly.

`AUTH_SERVICE_URL` is **not** set via `.env` — it's hardcoded in `docker-compose.yml` as
`http://euro-auth:3000`, the internal Docker network hostname.

## Database migrations

Each backend manages its own TypeORM migrations independently:

```bash
cd euro-auth               # or euro-platform-api
npm run migration:generate -- src/migrations/SomeMigrationName
npm run migration:run
npm run migration:revert
```

`postgres-init/001-create-auth-schema.sql` creates the `auth` schema on first container
start (Postgres's own `public` schema is used by `euro-platform-api`).

## Seeding vehicle catalog data

`euro-platform-api` includes a script that populates the vehicle make/model catalog from
[Wikidata](https://www.wikidata.org/) (free, public SPARQL endpoint, no API key needed):

```bash
cd euro-platform-api
npm run seed:catalog
```

Safe to re-run — it only fills gaps and won't duplicate existing rows.

## Testing

```bash
cd euro-auth               # or euro-platform-api or euro-platform-front
npm test
```

Backends also have `npm run test:e2e` and `npm run test:cov`.

## Notes on scope

This is a school project run locally via Docker Compose — there's no CI/CD pipeline or
cloud hosting configured. The notification system is a stub (logs only, no real email).
