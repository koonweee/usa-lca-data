#!/usr/bin/env python3
"""Benchmark only inside an isolated Docker container; never connects to an external DB."""
import argparse
import datetime
import json
from pathlib import Path
import random
import statistics
import subprocess
import time

HERE = Path(__file__).resolve().parent
CONTAINER = 'lca-employer-search-bench'
TERMS = ['o', 'op', 'open', 'openai', 'google', 'tech', 'microsoft', 'zzzznonexistent']
REPEATS = 7
WARMUPS = 2


def sql(text):
    p = subprocess.run(['docker', 'exec', '-i', CONTAINER, 'psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres'], input=text, text=True, capture_output=True)
    if p.returncode:
        raise RuntimeError(p.stderr)
    return p.stdout.strip()


def literal(value):
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def setup(employers, multiplier):
    # Recreate only this benchmark's tables inside its dedicated disposable container.
    sql('DROP TABLE IF EXISTS "LCADisclosure", "Employer"; CREATE EXTENSION IF NOT EXISTS pg_trgm;')
    sql('''CREATE TABLE "Employer" (
      uuid uuid PRIMARY KEY, name text NOT NULL, city text NOT NULL, state text,
      "postalCode" text NOT NULL, "naicsCode" text NOT NULL);
    CREATE TABLE "LCADisclosure" (
      "caseNumber" text PRIMARY KEY, "employerUuid" uuid NOT NULL REFERENCES "Employer"(uuid));
    CREATE TEMP TABLE source (uuid uuid, name text, city text, state text, postal text, naics text, n integer);
    INSERT INTO source VALUES ''' + ',\n'.join('(' + ','.join(literal(e.get(k)) for k in ['uuid', 'name', 'city', 'state', 'postalCode', 'naicsCode', 'count']) + ')' for e in employers) + f''';
    INSERT INTO "Employer"
      SELECT md5(s.uuid::text || ':' || g)::uuid, s.name, s.city, s.state, s.postal, s.naics
      FROM source s CROSS JOIN generate_series(1, {multiplier}) g;
    INSERT INTO "LCADisclosure"
      SELECT s.uuid::text || ':' || g || ':' || d, md5(s.uuid::text || ':' || g)::uuid
      FROM source s CROSS JOIN generate_series(1, {multiplier}) g CROSS JOIN LATERAL generate_series(1,s.n) d;
    ANALYZE "Employer"; ANALYZE "LCADisclosure";''')


def query(term, scope, method):
    escaped = term.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
    predicate = ('to_tsvector(e.name) @@ phraseto_tsquery(' + literal(term) + ')') if method == 'current' else 'e.name ILIKE ' + literal('%' + escaped + '%')
    if scope == 'matching':
        return f'SELECT count(*) FROM "Employer" e WHERE {predicate}'
    return f'''SELECT e.*, count(*) AS count FROM "LCADisclosure" d
      INNER JOIN "Employer" e ON d."employerUuid" = e.uuid
      WHERE {predicate} GROUP BY e.uuid ORDER BY e.name ASC LIMIT 21'''


def run_phase(scale, variants, output):
    jobs = [(term, scope, variant) for term in TERMS for scope in ['matching','dropdown'] for variant in variants]
    samples = {job: [] for job in jobs}
    plans = {}
    rng = random.Random(20260929)
    for rep in range(WARMUPS + REPEATS):
        rng.shuffle(jobs)
        # One psql connection per round, statement timings exclude connection/process overhead.
        commands = 'SET statement_timeout = \'30s\';\n' + '\n'.join('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' + query(*job) + ';' for job in jobs)
        raw = sql(commands)
        decoder = json.JSONDecoder()
        decoded = []
        while raw.strip():
            plan, end = decoder.raw_decode(raw.lstrip())
            decoded.append(plan[0])
            raw = raw.lstrip()[end:]
        assert len(decoded) == len(jobs)
        for job, plan in zip(jobs, decoded):
            if rep >= WARMUPS:
                samples[job].append(plan['Execution Time'])
                plans[job] = plan
        print(f'scale={scale} variants={variants} round={rep + 1}/{WARMUPS + REPEATS}', flush=True)
    for job in sorted(samples):
        term, scope, variant = job
        vals = samples[job]
        output.append(dict(scale=scale, term=term, scope=scope, variant=variant,
                           median_ms=statistics.median(vals), min_ms=min(vals), max_ms=max(vals),
                           samples_ms=vals, plan=plans[job]))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--multipliers', default='1,30')
    args = parser.parse_args()
    data = json.loads((HERE/'employers.json').read_text())
    results = {'created_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
               'source':'https://graphql.h1b1.work uniqueColumnValues.employers; unfiltered paginated snapshot',
               'employers':len(data), 'disclosures':sum(e['count'] for e in data),
               'repeats':REPEATS, 'warmups':WARMUPS, 'terms':TERMS,
               'server':sql("SELECT json_build_object('version',version(),'text_search_config',current_setting('default_text_search_config'),'shared_buffers',current_setting('shared_buffers'),'work_mem',current_setting('work_mem'),'max_parallel_workers_per_gather',current_setting('max_parallel_workers_per_gather'))"),
               'measurements':[], 'indexes':[], 'matches':{}}
    for scale in map(int,args.multipliers.split(',')):
        setup(data, scale)
        for term in TERMS:
            results['matches'][term] = {method:int(sql(query(term,'matching',method))) for method in ['current','substring']}
        if scale == 1:
            results['base_matches'] = results['matches'].copy()
            results['open_results'] = {method:json.loads(sql('SELECT coalesce(json_agg(t),\'[]\'::json) FROM (' + query('open','dropdown',method) + ') t')) for method in ['current','substring']}
        run_phase(scale, ['current','substring'], results['measurements'])
        start = time.perf_counter()
        sql('CREATE INDEX employer_name_trgm ON "Employer" USING gin (name gin_trgm_ops); ANALYZE "Employer";')
        build_ms = (time.perf_counter()-start)*1000
        results['indexes'].append({'scale':scale,'name':'employer_name_trgm','build_wall_ms':build_ms,'bytes':int(sql("SELECT pg_relation_size('employer_name_trgm')"))})
        run_phase(scale, ['trigram'], results['measurements'])
        sql('CREATE INDEX disclosure_employer_uuid ON "LCADisclosure" ("employerUuid"); ANALYZE "LCADisclosure";')
        run_phase(scale, ['trigram_plus_join_index'], results['measurements'])
        (HERE/'results.json').write_text(json.dumps(results,indent=2)+'\n')
    print('Saved results.json',flush=True)

if __name__ == '__main__':
    main()
