# LCA Data ETL Pipeline

A TypeScript-based ETL (Extract, Transform, Load) pipeline for processing H-1B, H-1B1, and E-3 visa LCA disclosure data from the US Department of Labor XLSX files.

> **Note**: DOL LCA disclosure files for 2020+ can be downloaded from `https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs/LCA_Disclosure_Data_FY2021_Q1.xlsx` (update FY202* and Q* as needed)

## Overview

This pipeline processes real DOL XLSX files through three stages:

- **Extract**: Reads and parses DOL XLSX files using streaming for memory efficiency
- **Transform**: Converts raw data to match database schema with type safety via Zod validation
- **Load**: Inserts transformed data into PostgreSQL database with proper relationships

## Architecture

### Core Components

- **`extract.ts`**: XLSX file parser that streams DOL disclosure data with column validation
- **`transform.ts`**: Type-safe data transformation using Prisma types and Zod schemas
- **`load.ts`**: Database operations with batch processing and error handling
- **`pipeline.ts`**: CLI orchestrator for batch processing multiple XLSX files
- **`types.ts`**: Zod schemas and TypeScript types for data validation
- **`inspect.ts`**: Utility to validate XLSX file headers against required columns
- **`analyze-empty-columns.ts`**: Analysis tool for identifying missing data patterns

### Key Features

- **Real XLSX Processing**: Streams DOL Excel files for memory-efficient processing
- **Type Safety**: Zod schema validation with Prisma client integration
- **Column Validation**: Automatic detection of missing required columns
- **Batch Processing**: Processes multiple files in sequence with comprehensive reporting
- **Data Analysis**: Built-in tools for analyzing data completeness
- **Error Recovery**: Graceful handling of malformed files and data errors
- **Progress Tracking**: Detailed logging and statistics for each processing stage

## Installation

```bash
# Install dependencies (uses bun for package management)
bun install

# Ensure GraphQL server Prisma client is generated
cd ../graphql-server && npx prisma generate
```

## Usage

### Pipeline Commands

```bash
# Process all XLSX files in raw_xlsx folder
npm run pipeline run ./raw_xlsx

# Clear database before processing
npm run pipeline run ./raw_xlsx --clear

# Clear all data from database
npm run pipeline clear

# Show help
npm run pipeline help
```

### Incremental seed commands

```bash
# Discover and ingest new DOL FY/Q files (default FY2018 -> current FY+1)
npm run seed:run

# Override fiscal year range
npm run seed:run -- --fy-start 2020 --fy-end 2026

# Force reingest selected quarters
npm run seed:run -- --force FY2026Q1,FY2025Q4

# Inspect latest seed run and current coverage
npm run seed:status

# Discovery only, no DB writes
npm run seed:list-available
```

### Data Analysis Tools

```bash
# Inspect XLSX file headers for required columns
npm run inspect file.xlsx
npm run inspect ./raw_xlsx/*.xlsx

# Analyze empty/missing data patterns
tsx src/analyze-empty-columns.ts file.xlsx
tsx src/analyze-empty-columns.ts ./raw_xlsx/*.xlsx
```

### Individual Components

```bash
# Extract data from specific XLSX file
npm run extract

# Transform extracted data
npm run transform  

# Load transformed data into database
npm run load

# Run tests
npm run test
```

## Data Flow

```
DOL XLSX Files → Extract (Stream) → Transform (Validate) → Load (Batch) → PostgreSQL
       ↓              ↓                   ↓                  ↓
   Column Check → Raw Records → Prisma Types → Database Records
```

## File Structure

```
data-preprocess/
├── src/
│   ├── extract.ts              # XLSX file streaming and parsing
│   ├── transform.ts            # Data transformation and validation  
│   ├── load.ts                 # Database insertion with batching
│   ├── pipeline.ts             # CLI for batch file processing
│   ├── seed/
│   │   └── runner.ts           # Incremental FY/Q discovery and seeding
│   ├── types.ts                # Zod schemas and TypeScript types
│   ├── inspect.ts              # XLSX header validation utility
│   ├── analyze-empty-columns.ts # Data completeness analysis
│   ├── fixture.ts              # Column name mappings
│   └── tests/
│       └── extract.test.ts     # Unit tests for extraction
├── raw_xlsx/                   # DOL XLSX files (22 quarterly files)
├── package.json
└── README.md
```

## Data Schema

### Raw Data (`RawLCADisclosure`)
Zod-validated schema matching DOL XLSX columns:
- **Case Details**: `CASE_NUMBER`, `CASE_STATUS`, `VISA_CLASS`, dates
- **Job Details**: `JOB_TITLE`, `SOC_CODE`, `SOC_TITLE`, `BEGIN_DATE`  
- **Wage Details**: wage rates, units, prevailing wage information
- **Employer Details**: name, address, contact, NAICS code

### Database Integration
Transforms to Prisma schema models:
- **LCADisclosure**: Primary visa application records
- **Employer**: Deduplicated company information with UUID
- **SOCJob**: Standard Occupational Classification jobs
- **Enums**: `casestatus`, `visaclass`, `payunit`

## Error Handling & Validation

- **Missing Columns**: Automatic detection via `inspect.ts`
- **Schema Validation**: Zod validation for all raw data
- **Constraint Violations**: Duplicate case numbers logged and skipped
- **File Errors**: Graceful handling of corrupted or malformed XLSX files
- **Batch Failures**: Detailed reporting of which files succeeded/failed

## Performance Features

- **Streaming Processing**: Memory-efficient XLSX parsing via `xlstream`
- **Batch Operations**: Configurable batch sizes for database operations
- **Concurrent Analysis**: Parallel processing for data analysis operations
- **Transaction Safety**: Database operations wrapped in transactions
- **Progress Reporting**: Real-time feedback during long-running operations

## Development

### Running Tests

```bash
npm run test        # Run all tests
npm run test:run    # Run tests once (CI mode)
```

### Adding New XLSX Files

1. Place XLSX files in `raw_xlsx/` directory
2. Run `npm run inspect ./raw_xlsx/*.xlsx` to validate headers
3. Process with `npm run pipeline run ./raw_xlsx`

### Data Quality Analysis

Use the analysis tools to understand data completeness:
```bash
# Analyze single file
tsx src/analyze-empty-columns.ts raw_xlsx/LCA_Disclosure_Data_FY2024_Q4.xlsx

# Analyze all files together
tsx src/analyze-empty-columns.ts raw_xlsx/*.xlsx
```

## Employer name matching

Employers use a separate `normalizedName` matching key and a readable `name`. Matching
removes periods and commas, collapses whitespace, and ignores case. Explicit aliases
in `src/employer-name-mappings.json` resolve to a preferred name before computing the
key. Unknown employers also deduplicate; their first stored display name is retained.
Uniqueness remains scoped to **matching key + postal code**, so different locations
remain separate. Conflicting aliases fail immediately rather than silently overriding
one another.

### Deploying this change

1. Pause seed/import jobs and take a database backup.
2. From `graphql-server`, with `DATABASE_URL` pointing at the intended database, run
   `npx prisma migrate deploy`. The employer migration normalizes existing names,
   merges duplicates at the same postal code, and reconnects applications and raw
   disclosure references. It preserves resume submissions and seed coverage records.
   The migration is transactional and briefly locks the affected tables.
3. Generate the Prisma client (`npx prisma generate`), build/deploy the updated backend
   and seed runner, then resume imports. Container builds already generate the client.

Do **not** reset the database or re-seed all quarters for this change. Existing
application records are updated by the migration, not by `seed:run --force`.

The migration contains a frozen mapping snapshot so it remains reproducible. For
future mapping changes, run the tests and add a new data migration if existing
employers need renaming or merging. Changing JSON alone affects future imports and
does not repair already-stored matching keys. There is no automatic mapping-update
script.

### Regression tests

`npm run test:run` runs the extraction and normalization tests. To also test the
actual PostgreSQL migration and importer, set `TEST_DATABASE_URL` to a disposable
PostgreSQL database before running the same command. The database role must be able
to create schemas; each test run creates and removes its own isolated schema. Generate
the updated Prisma client in `graphql-server` before testing or compiling.

## Job titles, locations, and postal codes

Job titles retain their readable spelling and punctuation. `normalizedJobTitle`
ignores only casing and whitespace. The API groups title filter options by this key,
uses the most frequent cleaned spelling as the label, and applies the same key to
row filtering, statistics, and employer facets. Existing URLs containing old spellings
continue to work. Seniority, C/C++/C#, and other punctuation differences remain distinct.

Employer cities have a separate `normalizedCity` key. The backfill chooses an existing
readable spelling within each state; new imports reuse that spelling when available.
State codes are trimmed and uppercased. This does not equate city aliases, expand state
names, or combine cities across states. New cities retain the cleaned source spelling.

Postal codes retain every digit, including source-formatted leading zeroes. Five-digit
ZIPs remain distinct from ZIP+4s; nine-digit or space-separated ZIP+4s become `12345-6789`.
Incomplete or unrecognized values are preserved, marked `postalCodeValid: false`, and
reported in import warnings. This flag validates US ZIP **format**, not whether the ZIP
exists. No missing zeroes are guessed. The API exposes the flag for inspection.

Optional worksite city/state/postal columns are now retained on future imports, with
matching and validation fields. Missing historical locations stay missing; no full
re-seed is required or performed. Raw disclosure source values remain unchanged.

Deploy migration `20260928010000_normalize_disclosure_fields` before starting the new API
and importer. It backfills existing titles and locations, merges only employer records
whose full postal codes become equal after formatting, and reconnects their references.
Applications, resume submissions and seed history are preserved. Pause imports during
rollout; old importers cannot populate the new required city key. Rollback of an image
does not undo this data migration. Use the documented deployment procedure above.

The opt-in PostgreSQL field integration suite additionally requires the backend to be
built first (`npm run build` in `graphql-server`) and a disposable test database role
with CREATE DATABASE permission. It creates/removes a dedicated database and exercises
the actual GraphQL resolvers as well as migration and import behavior.
