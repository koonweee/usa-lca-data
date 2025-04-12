"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeSubmissionQuery = exports.resumeSubmissionMutation = exports.ResumeSubmissionType = void 0;
const client_1 = require("@prisma/client");
const nexus_1 = require("nexus");
exports.ResumeSubmissionType = (0, nexus_1.objectType)({
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
exports.resumeSubmissionMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createResumeSubmission", {
            type: "ResumeSubmission",
            args: {
                name: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                email: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                linkedinUrl: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                s3key: (0, nexus_1.stringArg)(),
                targetJobs: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(_root, args, ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    try {
                        return yield ctx.prisma.resumeSubmission.create({
                            data: {
                                name: args.name.trim(),
                                email: args.email.trim(),
                                linkedinUrl: args.linkedinUrl.trim(),
                                s3key: (_a = args.s3key) === null || _a === void 0 ? void 0 : _a.trim(),
                                targetJobs: args.targetJobs.trim(),
                            },
                        });
                    }
                    catch (error) {
                        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                            error.code === "P2002") {
                            throw new Error("An application with this email already exists");
                        }
                        throw error;
                    }
                });
            },
        });
    },
});
// Query to fetch resume submissions
exports.resumeSubmissionQuery = (0, nexus_1.extendType)({
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
