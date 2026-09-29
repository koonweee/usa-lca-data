import { objectType } from "nexus";
import { Employer } from "nexus-prisma";

export const EmployerType = objectType({
  name: Employer.$name,
  description: Employer.$description,
  definition(t) {
    t.field(Employer.city);
    t.field(Employer.naicsCode);
    t.field(Employer.name);
    t.field(Employer.postalCode);
    t.field(Employer.postalCodeValid);
    t.field(Employer.normalizedCity);
    t.field(Employer.state);
    t.field(Employer.uuid);
  },
});
