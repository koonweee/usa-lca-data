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
