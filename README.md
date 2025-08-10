# USA LCA Data Browser

Browse H-1B, H-1B1 (Singapore/Chile), and E-3 (Australia) visa applications from the US Department of Labor.

Full-stack application built with GraphQL, Apollo Server, Prisma ORM, PostgreSQL, React, Vite, TailwindCSS, and shadcn/ui.

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

# For brand new/empty database, run Prisma migrations
npx prisma db push

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

# Generate GraphQL types from server schema (server must be running)
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
bun run codegen           # Generate GraphQL types from server schema
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
- **Integrations**: AWS S3 for resume uploads, GraphQL Codegen for type safety

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
