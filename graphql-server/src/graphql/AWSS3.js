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
exports.s3PresignMutation = exports.PresignedUrlType = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const nexus_1 = require("nexus");
// Then use it in the main type
exports.PresignedUrlType = (0, nexus_1.objectType)({
    name: "PresignedUrl",
    definition(t) {
        t.nonNull.string("url");
        t.nonNull.string("s3key");
    },
});
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
exports.s3PresignMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("getPresignedUrl", {
            type: exports.PresignedUrlType,
            args: {
                fileName: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve: (_parent_1, _a) => __awaiter(this, [_parent_1, _a], void 0, function* (_parent, { fileName }) {
                try {
                    const key = `uploads/${Date.now()}-${fileName}`;
                    const command = new client_s3_1.PutObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: key,
                    });
                    const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, {
                        expiresIn: 3600,
                    });
                    return {
                        url: signedUrl,
                        s3key: key,
                    };
                }
                catch (error) {
                    console.error('Error generating presigned URL:', error);
                    throw new Error('Failed to generate upload URL');
                }
            }),
        });
    },
});
