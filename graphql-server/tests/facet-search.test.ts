import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { graphql } from "graphql";
import { makeSchema } from "nexus";
import { Prisma } from "@prisma/client";
import * as disclosures from "../src/graphql/LCADisclosure";
import * as employers from "../src/graphql/Employer";
import * as jobs from "../src/graphql/SOCJob";
import * as date from "../src/graphql/scalars/Date";
import * as bigint from "../src/graphql/scalars/BigInt";
import * as args from "../src/graphql/args";

// Run only in a disposable PostgreSQL container. Each run creates its own database.
const container = process.env.TEST_POSTGRES_CONTAINER;
test("facet substring search against PostgreSQL and all migrations", { skip: !container }, async (t) => {
  const database = `facet_${randomUUID().replace(/-/g, "")}`;
  const psql = (sql: string, db = database) => execFileSync("docker", [
    "exec", "-i", container!, "psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", db,
  ], { input: sql, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  psql(`CREATE DATABASE "${database}"`, "postgres");
  try {
    const migrations = path.resolve(__dirname, "../prisma/migrations");
    for (const dir of readdirSync(migrations, { withFileTypes: true }).filter(d => d.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      psql(readFileSync(path.join(migrations, dir.name, "migration.sql"), "utf8"));
    }
    const ids = Array.from({ length: 4 }, () => randomUUID());
    const quote = (v: unknown) => v == null ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
    const names = ["OpenAI OpCo, LLC", "Open Source Labs", "100%_\\ Labs", "O'Reilly Analytics"];
    names.forEach((name, i) => psql(`INSERT INTO "Employer" (uuid,name,"normalizedName",city,"normalizedCity","postalCode","naicsCode") VALUES (${quote(ids[i])}::uuid,${quote(name)},${quote(name.toLowerCase())},'Boston','boston','02110','123')`));
    psql(`INSERT INTO "SOCJob" (code,title) VALUES ('15-1252','Software Developer')`);
    const fixtures = [
      [0, "Software Engineer", "Certified", "H-1B1 Singapore"],
      [0, "SOFTWARE ENGINEER", "Denied", "H-1B1 Singapore"],
      [0, "Software Engineer", "Certified", "H-1B"],
      [1, "Software Architect", "Certified", "H-1B1 Singapore"],
      [2, "100%_\\ Expert", "Certified", "H-1B1 Singapore"],
      [3, "C++ Developer", "Certified", "H-1B1 Singapore"],
      [3, "O'Reilly Analyst", "Certified", "H-1B1 Singapore"],
    ] as const;
    fixtures.forEach(([employer, title, status, visa], i) => psql(`INSERT INTO "LCADisclosure" ("caseNumber","jobTitle","normalizedJobTitle","socCode","fullTimePosition","receivedDate","decisionDate","beginDate","employerUuid","caseStatus","visaClass") VALUES ('case-${i}',${quote(title)},${quote(title.toLowerCase())},'15-1252',true,CURRENT_DATE,CURRENT_DATE,CURRENT_DATE,${quote(ids[employer])}::uuid,${quote(status)},${quote(visa)})`));
    const schema = makeSchema({ types: [disclosures, employers, jobs, date, bigint, args], outputs: false });
    // Execute the actual resolver-generated Prisma SQL in PostgreSQL. The Docker
    // transport avoids opening a database port or requiring local DB credentials.
    const contextValue = { prisma: { $queryRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const query = Prisma.sql(strings, ...values);
      const sql = query.strings.reduce((s, chunk, i) => s + chunk + (i < query.values.length ? quote(query.values[i]) : ""), "");
      return JSON.parse(psql(`SET standard_conforming_strings=on; SELECT coalesce(json_agg(result), '[]'::json) FROM (${sql}) result;`));
    } } };
    const search = async (kind: "employers" | "jobTitles", term?: string | null, filters: Record<string, string[]> = {}, skip = 0, take = 20) => {
      const employer = kind === "employers";
      const result = await graphql({ schema, source: `query($term:String,$filters:LCADisclosureFilters,$pagination:PaginationInput){uniqueColumnValues{${kind}(${employer ? "employerNameSearchStr" : "jobTitleSearchStr"}:$term,filters:$filters,pagination:$pagination){uniqueValues{${employer ? "name uuid" : "value"} count}hasNext}}}`,
        variableValues: { term, filters, pagination: { skip, take } }, contextValue });
      assert.equal(result.errors, undefined, JSON.stringify(result.errors));
      // Match the JSON response delivered over HTTP (GraphQL uses null-prototype objects).
      return JSON.parse(JSON.stringify((result.data as any).uniqueColumnValues[kind]));
    };
    await t.test("partial and mixed-case employer searches include OpenAI with correct counts", async () => {
      const result = await search("employers", "  oPeN  ");
      assert.deepEqual(result.uniqueValues.map((r: any) => [r.name, r.count]), [[names[0], 3], [names[1], 1]]);
      assert.equal(result.hasNext, false);
    });
    await t.test("title substrings normalize whitespace, group spellings, and preserve counts", async () => {
      assert.deepEqual((await search("jobTitles", " SOFTware   eng ")).uniqueValues, [{ value: "Software Engineer", count: 3 }]);
      assert.equal((await search("jobTitles", "soft")).uniqueValues.length, 2);
      assert.deepEqual((await search("jobTitles", "C++")).uniqueValues, [{ value: "C++ Developer", count: 1 }]);
    });
    await t.test("wildcards, backslashes, quotes, and SQL-like input remain literal", async () => {
      for (const kind of ["employers", "jobTitles"] as const) {
        for (const term of ["%", "_", "\\", "%_\\"]) {
          const rows = (await search(kind, term)).uniqueValues;
          assert.equal(rows.length, 1, `${kind}: ${term}`);
          assert.equal(rows[0][kind === "employers" ? "name" : "value"], kind === "employers" ? names[2] : "100%_\\ Expert");
        }
        assert.equal((await search(kind, "O'Reilly")).uniqueValues.length, 1);
        assert.equal((await search(kind, "' OR TRUE --")).uniqueValues.length, 0);
      }
    });
    await t.test("blank searches equal absent searches; short and missing searches work", async () => {
      for (const kind of ["employers", "jobTitles"] as const) {
        assert.deepEqual(await search(kind, " \t "), await search(kind));
        assert.equal((await search(kind, "zzzznotfound")).uniqueValues.length, 0);
        assert.ok((await search(kind, "o")).uniqueValues.length > 0);
      }
    });
    await t.test("active filters and exact selected titles remain in force", async () => {
      const filters = { caseStatus: ["Certified"], visaClass: ["H_1B1_Singapore"], employerUuid: [ids[0]], jobTitle: [" SOFTWARE   ENGINEER "] };
      assert.equal((await search("employers", "open", filters)).uniqueValues[0].count, 1);
      assert.deepEqual((await search("jobTitles", "soft", filters)).uniqueValues, [{ value: "Software Engineer", count: 1 }]);
      assert.equal((await search("employers", "open", { jobTitle: ["Software"] })).uniqueValues.length, 0);
      assert.equal((await search("jobTitles", "soft", { employerUuid: [ids[3]] })).uniqueValues.length, 0);
    });
    await t.test("pagination preserves ordering and hasNext", async () => {
      for (const [kind, term] of [["employers", "open"], ["jobTitles", "soft"]] as const) {
        const first = await search(kind, term, {}, 0, 1);
        const second = await search(kind, term, {}, 1, 1);
        assert.equal(first.hasNext, true);
        assert.equal(second.hasNext, false);
        assert.deepEqual([...first.uniqueValues, ...second.uniqueValues], (await search(kind, term)).uniqueValues);
      }
    });
    await t.test("both trigram indexes exist and support the actual predicates", () => {
      const checks = [
        ['"Employer"', 'name', "%open%", "Employer_name_trgm_idx"],
        ['"LCADisclosure"', '"normalizedJobTitle"', "%soft%", "LCADisclosure_normalizedJobTitle_trgm_idx"],
      ];
      for (const [table, column, pattern, index] of checks) {
        // Tiny fixtures normally favor a sequential scan. Disable it only to prove
        // index eligibility, not to claim real-world optimizer choice or speed.
        const plan = psql(`SET enable_seqscan=off; EXPLAIN (FORMAT JSON) SELECT * FROM ${table} WHERE ${column} ILIKE ${quote(pattern)} ESCAPE ${quote("\\")};`);
        assert.ok(plan.includes(index), plan);
      }
    });
  } finally {
    psql(`DROP DATABASE "${database}" WITH (FORCE)`, "postgres");
  }
});
