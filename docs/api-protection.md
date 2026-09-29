# Public GraphQL protection

The API remains public. These controls bound request work; they are not authentication or protection against a distributed denial-of-service attack.

- JSON request bodies: 32 KiB, no compressed bodies or HTTP query batching.
- Pagination: defaults to 20 results, 1–100 allowed; offsets 0–100,000. Null values use defaults.
- Search text: 200 characters. Each filter list: 50 entries; individual values: 500 characters; employer IDs must be UUIDs.
- GraphQL: 2,000 parser tokens, depth 10, 200 expanded field occurrences, 10 database-backed field occurrences, and weighted cost 10,000. Cost counts result fields by requested page size, plus 100 per database-backed field. Aliases and each fragment occurrence count separately. Directives cannot bypass limits. Inputs and cost are checked before execution on every request, including cached documents.
- Each client IP: 30 requests per 10 seconds and 120 per minute. IPv6 addresses group by /56. Rejected requests count; preflight OPTIONS does not. Excess returns HTTP 429 with Retry-After. Counters are in memory and reset on restart; multiple API replicas would require a shared store. Clients behind the same NAT share limits.
- Every API PostgreSQL connection has a 5-second statement timeout. PostgreSQL cancels work; this is not merely a client wait timeout. Startup verifies the setting. Migrations and ingestion use their existing connections without this timeout.

`TRUST_PROXY_HOPS` defaults to `0` for direct access. Production sets `1`: exactly one Traefik hop, no published API host port, and a dedicated ingress network. Express uses the rightmost forwarded address, so caller-injected earlier addresses cannot choose a rate-limit identity. Reassess this setting before changing ingress topology. CORS remains available to browser callers and does not authenticate requests.

Validate with `npm run build` and `npm test` in `graphql-server`. Set `TEST_POSTGRES_CONTAINER` to a disposable PostgreSQL container for migration/search integration tests. Set `TEST_DATABASE_URL` to its local URL to test actual Prisma statement cancellation and pool recovery. Do not use a production database for those fixture tests.
