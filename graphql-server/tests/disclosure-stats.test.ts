import assert from "node:assert/strict";
import { test } from "node:test";
import { graphql } from "graphql";
import { makeSchema } from "nexus";
import * as disclosures from "../src/graphql/LCADisclosure";
import * as employers from "../src/graphql/Employer";
import * as jobs from "../src/graphql/SOCJob";
import * as date from "../src/graphql/scalars/Date";
import * as bigint from "../src/graphql/scalars/BigInt";
import * as args from "../src/graphql/args";
const schema = makeSchema({
  types: [disclosures, employers, jobs, date, bigint, args],
  outputs: false,
});
const rows = [
  ...Array.from({ length: 94 }, () => ({
    caseStatus: "Certified",
    visaClass: "H_1B1_Singapore",
    employerUuid: "a",
    jobTitle: "Engineer",
  })),
  ...Array.from({ length: 4 }, () => ({
    caseStatus: "Certified___Withdrawn",
    visaClass: "H_1B1_Singapore",
    employerUuid: "a",
    jobTitle: "Engineer",
  })),
  ...Array.from({ length: 2 }, () => ({
    caseStatus: "Denied",
    visaClass: "H_1B1_Singapore",
    employerUuid: "a",
    jobTitle: "Engineer",
  })),
  {
    caseStatus: "Denied",
    visaClass: "H_1B1_Singapore",
    employerUuid: "b",
    jobTitle: "Designer",
  },
];
const contextValue = {
  prisma: {
    lCADisclosure: {
      count: async ({ where }: { where: Record<string, { in: string[] }> }) =>
        rows.filter((row) =>
          Object.entries(where).every(([key, condition]) =>
            condition.in.includes(row[key as keyof typeof row]),
          ),
        ).length,
    },
  },
};
async function stats(filters: Record<string, string[]>) {
  const result = await graphql({
    schema,
    source:
      "query($filters: LCADisclosureFilters){ lcaDisclosures { stats(filters:$filters){totalCount successPercentage} } }",
    variableValues: { filters },
    contextValue,
  });
  assert.equal(result.errors, undefined, JSON.stringify(result.errors));
  return (
    result.data as unknown as {
      lcaDisclosures: {
        stats: { totalCount: number; successPercentage: number };
      };
    }
  ).lcaDisclosures.stats;
}
test("status selection changes matching count but preserves the all-status cohort", async () => {
  const value = await stats({
    caseStatus: ["Certified___Withdrawn"],
    employerUuid: ["a"],
    visaClass: ["H_1B1_Singapore"],
    jobTitle: ["Engineer"],
  });
  assert.equal(value.totalCount, 4);
  assert.equal(value.successPercentage, 94);
});
test("non-status filters constrain both sides of the rate", async () => {
  const value = await stats({
    employerUuid: ["b"],
    visaClass: ["H_1B1_Singapore"],
  });
  assert.equal(value.totalCount, 1);
  assert.equal(value.successPercentage, 0);
});
test("empty cohort has a finite rate", async () => {
  const value = await stats({ employerUuid: ["missing"] });
  assert.equal(value.totalCount, 0);
  assert.equal(value.successPercentage, 0);
});
