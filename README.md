# USA LCA Data Browser

Browse H-1B, H-1B1 (Singapore/Chile), and E-3 (Australia) visa applications from the US Department of Labor.

Full-stack application built with GraphQL, Apollo Server, Prisma ORM, PostgreSQL, React, Vite, TailwindCSS, and shadcn/ui.

NOTE: Last ingested file was `LCA_Disclosure_Data_FY2020_Q5.xlsx`

## Project Structure

- **`data-preprocess/`** - Data processing pipeline for DOL XLSX files → JSON → PostgreSQL
- **`graphql-server/`** - Apollo Server with Prisma ORM and PostgreSQL backend
- **`react-client/`** - React frontend with Vite, TailwindCSS, and shadcn/ui components

## Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Docker](https://www.docker.com/) - For PostgreSQL database
- [Node.js](https://nodejs.org/) - Required for some tools (even when using bun)

## Development Setup

### 1. Environment Configuration

```bash
# Copy environment template
cp graphql-server/.env.example graphql-server/.env
```

Edit `.env` if needed (defaults should work for local development):
- `POSTGRES_USER=lca_user`
- `POSTGRES_PASSWORD=lca_password` 
- `POSTGRES_DB=lca_database`
- `POSTGRES_PORT=5432`

### 2. Backend Setup (GraphQL Server)

```bash
cd graphql-server

# Install dependencies
bun install

# Start PostgreSQL database in Docker
bun run db:up

# For brand new/empty database, apply migrations (includes pg_trgm and indexes)
npx prisma migrate deploy

# Alternative: Use migrate dev for development
# npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start GraphQL server (http://localhost:4000)
bun run dev
```

### 3. Frontend Setup (React Client)

```bash
cd react-client

# Install dependencies
bun install

# Generate GraphQL types from the checked-in server schema
bun run codegen

# Start frontend development server (http://localhost:5173)
bun run dev
```

## Available Scripts

### Backend (graphql-server)

```bash
bun run dev                # Start development server with hot reload
bun run build             # Build for production
bun run start             # Start production server
bun run generate          # Generate GraphQL schema
bun run setup             # Install deps and generate Prisma client

# Database management
bun run db:up             # Start PostgreSQL database
bun run db:down           # Stop PostgreSQL database  
bun run db:logs           # View database logs
bun run db:reset          # Reset database (removes all data)

# Prisma commands
npx prisma migrate dev    # Run database migrations
npx prisma migrate deploy # Run production migrations
npx prisma db push        # Push schema changes to database
npx prisma studio         # Open Prisma Studio
npx prisma db seed        # Seed database
```

### Frontend (react-client)

```bash
bun run dev               # Start Vite dev server
bun run build             # Build for production (includes TypeScript check)
bun run lint              # Run ESLint
bun run preview           # Preview production build
bun run codegen           # Generate GraphQL types from local server schema
```

## Development Workflow

1. **Start backend**: `cd graphql-server && bun run db:up && bun run dev`
2. **Start frontend**: `cd react-client && bun run codegen && bun run dev`
3. **Access application**: 
   - Frontend: http://localhost:5173
   - GraphQL Playground: http://localhost:4000
   - Database Studio: `npx prisma studio` (from graphql-server/)

## Architecture Overview

- **Database**: PostgreSQL with Prisma ORM, UUID primary keys, full-text search
- **Backend**: Apollo Server with Nexus GraphQL, custom scalars (BigInt, DateTime)
- **Frontend**: React with TanStack Table, Apollo Client, infinite scroll, dark mode
- **Type safety**: GraphQL Codegen generates frontend types from the local server schema

### Employer and job-title search

The desktop and mobile dropdowns use case-insensitive literal substring matching:
`open` matches OpenAI and `soft` matches Software Engineer. Job-title search also
collapses whitespace to match stored normalized titles. `%`, `_`, and backslashes
are literal input, not SQL wildcards. Blank searches return the usual options.
Active filters, counts, ordering, and pagination are preserved; selecting a title
still applies an exact normalized-title filter.

Migration `20260929000000_trigram_facet_search` enables PostgreSQL `pg_trgm` and adds
GIN indexes on `Employer.name` and `LCADisclosure.normalizedJobTitle`. Apply it with
`npx prisma migrate deploy` before deploying the API build. The migration role must
be allowed to install the extension. Ordinary index creation briefly blocks writes
to those tables; schedule rollout accordingly. Short searches still work, but
one- and two-character patterns generally cannot benefit from trigram lookup.
The existing title B-tree index remains for exact filters. Reverting the API build
does not require dropping these additive indexes or the extension.

Run `npm test` in `graphql-server` for the standard suite. To exercise all migrations
and the actual facet SQL in PostgreSQL 15, start a disposable container and set
`TEST_POSTGRES_CONTAINER`; the integration test creates and drops its own database:

```bash
docker run --detach --rm --name lca-search-tests --network none -e POSTGRES_PASSWORD=local-test-only postgres:15.19-trixie
docker exec lca-search-tests pg_isready -U postgres
# After pg_isready succeeds, run from graphql-server:
TEST_POSTGRES_CONTAINER=lca-search-tests npm test
docker stop lca-search-tests
```

The [API usage audit](docs/api-usage-audit.md) distinguishes active frontend calls,
dormant components/documents, and fields with no frontend callers.

## Troubleshooting

### Database Issues
```bash
# Reset database completely
cd graphql-server
bun run db:reset
npx prisma db push
```

### GraphQL Types Not Generated
```bash
# Ensure GraphQL server is running first
cd graphql-server && bun run dev

# Then in another terminal
cd react-client && bun run codegen
```

### Port Conflicts
- GraphQL Server: Port 4000
- React Client: Port 5173  
- PostgreSQL: Port 5432

Change ports in respective config files if needed.

## Data Pipeline

Raw DOL XLSX files → JSON conversion → PostgreSQL via Prisma → GraphQL API → React frontend

Seed metadata is tracked in PostgreSQL (`SeedRun`, `SeedRunQuarter`, `SeededQuarter`) so incremental runs can skip already-seeded fiscal quarters and report dataset coverage.

### Data Processing (data-preprocess)

```bash
cd data-preprocess

# Install dependencies
bun install

# Process single XLSX file
tsx src/pipeline.ts run ./path/to/file.xlsx

# Process all XLSX files in a folder
tsx src/pipeline.ts run ./raw_xlsx

# Incremental seed from DOL (default FY2018 -> current FY+1)
npm run seed:run

# Force re-ingest selected quarters
npm run seed:run -- --force FY2026Q1,FY2025Q4

# Show latest run and seeded coverage range
npm run seed:status

# List discoverable FY/Q files only (no DB writes)
npm run seed:list-available

# Clear database before processing
tsx src/pipeline.ts run ./path/to/file.xlsx --clear
tsx src/pipeline.ts run ./raw_xlsx --clear

# Clear all data
tsx src/pipeline.ts clear

# Show help
tsx src/pipeline.ts help
```
