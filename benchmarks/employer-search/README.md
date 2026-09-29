# Employer search benchmark

Captured 2026-09-29. Trigram substring matching materially outperformed the current unindexed full-text predicate in this local benchmark. Production was not modified or benchmarked directly.

## Data and method

- Public API snapshot: **3,341 employer records, 9,366 disclosures**. Employer names, UUIDs, locations, and disclosure counts are real, collected without filters. Snapshot pagination is not transactionally consistent; duplicate UUIDs were checked, but changes during collection could still affect coverage.
- Local PostgreSQL **15.19** (`postgres:15.19-trixie`), matching the version declared in Stack v2. Docker uses OrbStack/aarch64, 10 CPUs and approximately 8 GiB VM memory. PostgreSQL settings are in `results.json`.
- The local Employer table contains the fields returned by the API. Disclosure rows are reconstructed from each employer's count, with only caseNumber and employerUuid. They reproduce unfiltered join cardinalities, not complete production row widths or filter distributions. Normalized employer fields and unrelated indexes are omitted.
- Primary keys and the disclosure foreign key exist. No text-search or disclosure-employer index exists in the baseline, consistent with the relevant checked-in schema. Live production indexes were not inspected.
- Current predicate: `to_tsvector(e.name) @@ phraseto_tsquery(term)`, default English configuration. Substring predicate: `e.name ILIKE '%term%'`. Trigram uses the same substring predicate with a GIN `gin_trgm_ops` index.
- Dropdown query follows the resolver's unfiltered join, `count(*)`, grouping by employer UUID, alphabetical sort, and `LIMIT 21` (20 options plus hasNext). Separate matching-only queries count matching employers without the disclosure join.
- Two warmup rounds, seven measured rounds per query, randomized job order within each phase. Values below are **median PostgreSQL EXPLAIN ANALYZE execution milliseconds**, excluding connection, network, GraphQL, frontend debounce, and planning time. EXPLAIN instrumentation adds overhead; these are warm-cache, single-client measurements, not load tests or p95 estimates. Phase order is baseline, trigram, then trigram plus join index.
- The 30× stress case repeats the same employer names and count distribution with different UUIDs: **100,230 employers and 280,980 disclosures**. This is a synthetic scale check, not a forecast of future name diversity or production latency.

## Full dropdown query, current dataset size

| Search | current | substring | trigram |
|---|---:|---:|---:|
| `o` | 6.088 | 2.809 | 2.625 |
| `op` | 6.028 | 1.559 | 1.407 |
| `open` | 6.824 | 1.379 | 0.565 |
| `openai` | 7.074 | 1.373 | 0.517 |
| `google` | 6.626 | 1.486 | 0.533 |
| `tech` | 6.419 | 1.574 | 0.665 |
| `microsoft` | 6.672 | 1.570 | 0.564 |
| `zzzznonexistent` | 6.832 | 1.040 | 0.962 |

For `open`, current full-text matching finds one employer record; substring finds six, including both OpenAI employer records. `openai` and `google` each match exactly two records with either approach, providing comparisons with equal result cardinality. `tech` matches 9 versus 172; `o` matches 1 versus 2,189. Broader matches necessarily increase aggregation work.

## Full dropdown query, 30× replicated dataset

| Search | current | substring | trigram |
|---|---:|---:|---:|
| `o` | 77.676 | 74.695 | 68.358 |
| `op` | 78.296 | 21.264 | 19.620 |
| `open` | 80.086 | 20.463 | 7.682 |
| `openai` | 83.411 | 19.544 | 7.395 |
| `google` | 84.876 | 19.889 | 7.744 |
| `tech` | 78.298 | 55.751 | 11.837 |
| `microsoft` | 81.556 | 21.029 | 7.885 |
| `zzzznonexistent` | 82.553 | 13.900 | 1.764 |

## Matching only, current dataset size

| Search | current | substring | trigram |
|---|---:|---:|---:|
| `o` | 5.777 | 0.940 | 0.838 |
| `op` | 5.938 | 0.934 | 0.844 |
| `open` | 6.388 | 0.941 | 0.011 |
| `openai` | 6.157 | 0.921 | 0.009 |
| `google` | 6.095 | 0.945 | 0.010 |
| `tech` | 5.876 | 0.945 | 0.085 |
| `microsoft` | 6.743 | 0.983 | 0.013 |
| `zzzznonexistent` | 6.801 | 1.045 | 0.969 |

## Join-index diagnostic

Adding an index on `LCADisclosure(employerUuid)` lets selective matches avoid scanning every disclosure. This is an additional schema change and must not be attributed to the trigram index alone. It is not uniformly beneficial: at 30×, the broad `o` query became slower with the extra index available. Planner behavior and selectivity matter.

| Search | trigram | trigram_plus_join_index |
|---|---:|---:|
| `o` | 2.625 | 2.615 |
| `op` | 1.407 | 1.387 |
| `open` | 0.565 | 0.042 |
| `openai` | 0.517 | 0.023 |
| `google` | 0.533 | 0.065 |
| `tech` | 0.665 | 0.655 |
| `microsoft` | 0.564 | 0.068 |
| `zzzznonexistent` | 0.962 | 0.973 |

## Plans, costs, and recommendation

- Saved plans confirm `open` uses an Employer sequential scan for the current predicate and a trigram bitmap index scan after the GIN index is added. With the extra join index, it uses a nested-loop join with indexed disclosure lookups.
- `o` and `op` still use employer sequential scans with the trigram index present. Their patterns have no complete trigram; retain the existing debounce and consider a minimum search length only if real load requires it.
- Trigram index size: **456 KiB** at current size and **5.36 MiB** at 30×. Build-plus-ANALYZE wall times were approximately **85 ms** and **445 ms**, including the local Docker/psql process overhead. These are isolated ordinary index builds, not production concurrent-build timings. Write overhead was not measured.
- Recommend case-insensitive substring matching plus a GIN trigram index. The measured current-size gain for `open` is about **12×**, saving about **6.3 ms of database execution**. The existing **300 ms debounce** and network latency remain; do not interpret this as a 12× faster visible UI.
- Evaluate the disclosure join index separately against production filter combinations before adding it. The benchmark does not compare against a separately indexed full-text implementation or prefix-only full-text matching.
- Stack v2 identifies the private production database on `sf-external`, with no host port. Direct SSH was unavailable: the documented workstation key was absent and host verification failed. No credentials were extracted, no production index was created, and no service was restarted.

## Reproduce

Run from this repository root with Python 3 and Docker. Use an isolated container with this exact name; the benchmark recreates its two tables. The container exposes no host port and has no network access.

```sh
# Optional: refresh snapshot (results will then reflect the new data).
python3 benchmarks/employer-search/fetch.py

docker run --detach --rm --name lca-employer-search-bench --network none -e POSTGRES_PASSWORD=local-benchmark-only postgres:15.19-trixie
docker exec lca-employer-search-bench pg_isready -U postgres
# Wait for pg_isready to succeed before running:
python3 benchmarks/employer-search/benchmark.py
# For just the current size, append: --multipliers 1

docker stop lca-employer-search-bench
```

`results.json` contains all timings, configuration, match counts, and a representative full buffer/query plan per case. `summary.csv` is the compact measured-results table. This report and CSV describe the captured run; rerunning benchmark.py updates results.json only.
