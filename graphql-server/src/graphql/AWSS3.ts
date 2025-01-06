import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { extendType, nonNull, objectType, stringArg } from "nexus";


// Then use it in the main type
export const PresignedUrlType = objectType({
  name: "PresignedUrl",
  definition(t) {
    t.nonNull.string("url");
    t.nonNull.string("s3key");
  },
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const s3PresignMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("getPresignedUrl", {
      type: PresignedUrlType,
      args: {
        fileName: nonNull(stringArg()),
      },
      resolve: async (_parent, { fileName }) => {
        try {
          const key = `uploads/${Date.now()}-${fileName}`;
          
          const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
          })

          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          })

          return {
            url: signedUrl,
            s3key: key,
          };
        } catch (error) {
          console.error('Error generating presigned URL:', error);
          throw new Error('Failed to generate upload URL');
        }
      },
    });
  },
});
