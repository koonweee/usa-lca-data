# GraphQL API cleanup

Assessed 2026-09-29 against the server TypeScript definitions and mounted React frontend. External-client traffic was not inspected. The owner approved removal of these unused fields.

## Removed API surface

| Removed field | Evidence before removal |
|---|---|
| `Query.resumeSubmissions` | No frontend caller. Unfiltered `findMany()` exposed submission data without authentication in server code. An authorized public ID-only query returned an empty array; no names or contact details were retrieved. |
| `Mutation.getPresignedUrl` | Only caller was the unmounted resume form. Issued one-hour S3 PUT URLs. |
| `Mutation.createResumeSubmission` | Only caller was the unmounted resume form. |
| `Query.employers` | No frontend caller; dropdown uses `uniqueColumnValues.employers` instead. |
| `Query.socJobs` | No frontend caller; table uses nested `LCADisclosure.socJob` instead. |
| `Query.uniqueColumnValues.visaClasses` | Query document existed, but its toolbar hook was commented out. No mobile caller. |

Removed the dormant resume component, its two mutation documents, the visa-class query document, obsolete GraphQL types, and unused S3/form dependencies. Regenerated the server schema/typegen and frontend operation types. Codegen now reads the local server schema rather than requiring a running API. The `ResumeSubmission` database model and all stored data remain intact; no destructive migration was added.

## Retained API surface

- `Query.lcaDisclosures.items` and `.stats`: table data, counts, and certification cohort statistics.
- `Query.uniqueColumnValues.employers`, `.jobTitles`, and `.caseStatuses`: desktop/mobile filters. Employer and title search now use literal case-insensitive substring matching with GIN trigram indexes.
- `Query.dataCoverage`: mounted coverage footer.
- Nested disclosure employer and SOC relations: selected by the table query.
- The API no longer defines any mutations.

## Additional findings

- The newer `Employer.normalizedCity`, `Employer.postalCodeValid`, `LCADisclosure.normalizedWorksiteCity`, and `LCADisclosure.worksitePostalCodeValid` output fields are not currently selected by the frontend. They remain available; schema regeneration corrected stale generated artifacts that omitted them.
- Disclosure items/stats hardcode H-1B1 Singapore while SQL facet resolvers honor passed visa filters. Expanding supported visa classes would require reconciling this behavior; it was not changed here.
- Static usage analysis does not establish whether an external client relied on removed fields. Such calls now fail GraphQL validation.

## Validation

- Regression test checks that all six retired fields fail before database access.
- PostgreSQL 15 integration tests exercise all migrations, partial and case-insensitive search, literal `%`/`_`/backslash handling, title normalization, active filters, counts, pagination, and index eligibility.
- Frontend GraphQL documents and inline cohort query are checked against the rebuilt schema; frontend/backend production builds must pass before release.
- After rollout, verify the public schema lacks the retired fields, active queries still work, and `open` returns OpenAI. No resume values need to be requested for verification.

Evidence: [server GraphQL exports](../graphql-server/src/graphql/index.ts), [server context](../graphql-server/src/context.ts), [frontend App](../react-client/src/App.tsx), [table page](../react-client/src/features/disclosures/page.tsx), [desktop filters](../react-client/src/features/disclosures/data-table-toolbar.tsx), [mobile filters](../react-client/src/features/disclosures/mobile-filters.tsx).
