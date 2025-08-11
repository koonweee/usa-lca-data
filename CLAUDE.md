# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack application for browsing H-1B, H-1B1 (Singapore/Chile), and E-3 (Australia) visa applications data from the US Department of Labor. The project consists of three main components:

1. **Data Processing Pipeline** (`data-preprocess/`) - Processes DOL XLSX files into structured JSON
2. **GraphQL Server** (`graphql-server/`) - Apollo Server with Prisma ORM and PostgreSQL
3. **React Client** (`react-client/`) - Vite-powered React frontend with TailwindCSS and shadcn/ui

## Development Commands

### GraphQL Server
```bash
cd graphql-server
npm run setup              # Install deps and generate Prisma client
npm run db:up              # Start local PostgreSQL database
npm run dev                # Start development server with hot reload
npm run build              # Build for production
npm run start              # Start production server
npm run generate           # Generate GraphQL schema
npx prisma migrate dev     # Run database migrations
npx prisma studio          # Open Prisma Studio
npx prisma db seed         # Seed database

# Database management
npm run db:down            # Stop PostgreSQL database
npm run db:logs            # View database logs
npm run db:reset           # Reset database (removes all data)
```

### React Client
```bash
cd react-client
npm run dev                # Start Vite dev server
npm run build              # Build for production (includes TypeScript check)
npm run lint               # Run ESLint
npm run preview            # Preview production build
npm run codegen            # Generate GraphQL types from server schema
```

### Data Processing
```bash
cd data-preprocess
# Uses bun for package management
bun install                # Install dependencies
tsx inspect.ts file.xlsx   # Inspect XLSX file headers
tsx src/pipeline.ts        # Run processing pipeline
tsx src/extract.ts         # Extract data
tsx src/transform.ts       # Transform data
tsx src/load.ts            # Load data
```

## Architecture

### Database Layer (Prisma + PostgreSQL)
- **Core Models**: `LCADisclosure`, `Employer`, `SOCJob`, `ResumeSubmission`
- **Raw Data**: `RawDisclosureData` stores unprocessed DOL data
- **Full-text search** enabled via Prisma preview features
- Uses UUID for primary keys where appropriate

### GraphQL API (Nexus + Apollo Server)
- Schema-first approach using Nexus with Prisma integration
- Custom scalars: `BigInt`, `DateTime` 
- AWS S3 integration for resume uploads via presigned URLs
- Context provides Prisma client access
- Schema generation outputs to `schema.graphql` and `nexus-typegen.ts`

### Frontend (React + Vite + TailwindCSS)
- **UI Framework**: shadcn/ui components built on Radix UI
- **Data Table**: TanStack Table with pagination, filtering, and infinite scroll
- **State Management**: Apollo Client for GraphQL data
- **Styling**: TailwindCSS with custom design system
- **Code Generation**: GraphQL Codegen generates TypeScript types from server schema

### Key Integrations
- **GraphQL Codegen**: Automatically generates TypeScript types from server schema at `http://localhost:4000`
- **S3 Integration**: Resume uploads via presigned URLs
- **Full-text Search**: PostgreSQL full-text search on LCA disclosures
- **Dark Mode**: Theme provider with system preference detection

## Development Workflow

### Initial Setup
1. **Copy Environment File**: `cp .env.example .env` (edit as needed)
2. **Start Local Database**: `cd graphql-server && npm run db:up`
3. **Setup Database**: `cd graphql-server && npx prisma migrate dev`
4. **Start GraphQL Server**: `cd graphql-server && npm run dev` (port 4000)
5. **Generate Types**: `cd react-client && npm run codegen` (requires server running)
6. **Start Frontend**: `cd react-client && npm run dev` (port 5173)

### Environment Configuration
Copy `.env.example` to `.env` and configure:
- **POSTGRES_USER**: Database username (default: `lca_user`)
- **POSTGRES_PASSWORD**: Database password (default: `lca_password`) 
- **POSTGRES_DB**: Database name (default: `lca_database`)
- **POSTGRES_PORT**: Database port (default: `5432`)
- **DATABASE_URL**: Full connection string for Prisma

## Data Pipeline

Raw DOL XLSX files → JSON conversion → PostgreSQL via Prisma → GraphQL API → React frontend

The processing pipeline handles wage data conversion, date parsing, enum mapping, and employer UUID generation for normalization.

## Deployment

- **Server**: Dockerized GraphQL server with PostgreSQL
- **Client**: Deployed to Vercel (noted in docker-compose)
- **Proxy**: Nginx Proxy Manager with Cloudflare DDNS