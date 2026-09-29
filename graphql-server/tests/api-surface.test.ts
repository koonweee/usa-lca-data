import assert from "node:assert/strict";
import { test } from "node:test";
import { makeSchema } from "nexus";
import { graphql } from "graphql";
import * as types from "../src/graphql";

const schema = makeSchema({ types, outputs: false });
test("retired API fields are rejected before any database access", async () => {
  let accesses = 0;
  const contextValue = { prisma: new Proxy({}, { get: () => { accesses++; throw new Error("Unexpected database access"); } }) };
  for (const source of [
    "{ resumeSubmissions { id email } }",
    "{ employers { items { uuid } } }",
    "{ socJobs { code } }",
    "{ uniqueColumnValues { visaClasses { uniqueValues { count } } } }",
    'mutation { getPresignedUrl(fileName:"resume.pdf") { url } }',
    'mutation { createResumeSubmission(name:"Test",email:"test@example.test",linkedinUrl:"test",targetJobs:"test") { id } }',
  ]) {
    const result = await graphql({ schema, source, contextValue });
    assert.ok(result.errors?.length, source);
    assert.ok(result.data == null);
  }
  assert.equal(accesses, 0);
});
