import { Prisma } from "@prisma/client";
import { objectType, extendType, nonNull, stringArg } from "nexus";

export const ResumeSubmissionType = objectType({
  name: "ResumeSubmission",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nonNull.string("email");
    t.nonNull.string("linkedinUrl");
    t.string("s3key");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.string("targetJobs");
  },
});

export const resumeSubmissionMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createResumeSubmission", {
      type: "ResumeSubmission",
      args: {
        name: nonNull(stringArg()),
        email: nonNull(stringArg()),
        linkedinUrl: nonNull(stringArg()),
        s3key: stringArg(),
        targetJobs: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        try {
          return await ctx.prisma.resumeSubmission.create({
            data: {
              name: args.name.trim(),
              email: args.email.trim(),
              linkedinUrl: args.linkedinUrl.trim(),
              s3key: args.s3key?.trim(),
              targetJobs: args.targetJobs.trim(),
            },
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            throw new Error("An application with this email already exists");
          }
          throw error;
        }
      },
    });
  },
});

// Query to fetch resume submissions
export const resumeSubmissionQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("resumeSubmissions", {
      type: "ResumeSubmission",
      resolve(_root, _args, ctx) {
        return ctx.prisma.resumeSubmission.findMany();
      },
    });
  },
});
