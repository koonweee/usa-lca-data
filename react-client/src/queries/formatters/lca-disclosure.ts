import { Casestatus, Payunit, Visaclass } from "@/graphql/generated";
import { LCADisclosure } from "@/lib/types";

export type DisplayLCADisclosure = ReturnType<typeof getDisplayLCADisclosure>;

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function getDisplayLCADisclosure(lcaDisclosure: LCADisclosure) {
  const {
    visaClass,
    employer,
    beginDate,
    wageRateOfPayFrom,
    wageRateOfPayUnit,
    caseStatus,
    caseNumber,
    socJob,
    jobTitle,
  } = lcaDisclosure;
  return {
    caseNumber,
    caseStatus: CASE_STATUS_ENUM_TO_READABLE[caseStatus],
    visaClass: VISA_CLASS_ENUM_TO_READABLE[visaClass],
    employer: {
      name: employer.name,
      city: employer.city,
      state: employer.state,
    },
    startDate: new Date(beginDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    socJob: {
      title: socJob.title,
    },
    jobTitle,
    // Convert wageRateOfPayFrom to annual salary
    // Wage rate of pay is stored in cents
    salary:
      wageRateOfPayFrom && wageRateOfPayUnit
        ? USDollar.format(
            getSalaryAsDollars(wageRateOfPayFrom, wageRateOfPayUnit)
          )
        : undefined,
  };
}

export function getSalaryAsDollars(
  wageRateOfPayFrom: bigint,
  wageRateOfPayUnit: Payunit
): number {
  return (
    (Number(wageRateOfPayFrom) / 100) *
    PAY_UNIT_ENUM_TO_MULTIPLIER[wageRateOfPayUnit]
  );
}

export const VISA_CLASS_ENUM_TO_READABLE: Record<Visaclass, string> = {
  H_1B: "H-1B",
  H_1B1_Chile: "H-1B1 Chile",
  H_1B1_Singapore: "H-1B1 Singapore",
  E_3_Australian: "E-3 Australian",
};

export const CASE_STATUS_ENUM_TO_READABLE: Record<Casestatus, string> = {
  Certified: "Certified",
  Certified___Withdrawn: "Certified Withdrawn",
  Denied: "Denied",
  Withdrawn: "Withdrawn",
};

export const PAY_UNIT_ENUM_TO_MULTIPLIER: Record<Payunit, number> = {
  Bi_Weekly: 26,
  Hour: 2080,
  Month: 12,
  Week: 52,
  Year: 1,
};
