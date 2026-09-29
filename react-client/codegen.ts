import type { CodegenConfig } from '@graphql-codegen/cli';
import { BigIntResolver, DateTimeResolver } from 'graphql-scalars';

const config: CodegenConfig = {
  // Use the generated server schema so codegen needs no running API.
  schema: "../graphql-server/schema.graphql",
  // TypeScript files in which to look for GraphQL operations (queries/mutations/fragments) to generate types for
  documents: ['src/**/*.graphql'],
  // Output directory for generated (type) files
  generates: {
    './src/graphql/generated.ts': {
      plugins: [
        "typescript",
        "typescript-operations",
        "typed-document-node"
      ],
    },
  },
  config: {
    scalars: {
      DateTime: DateTimeResolver.extensions.codegenScalarType,
      BigInt: BigIntResolver.extensions.codegenScalarType,
    }
  },
  // Ignore that we don't have any tsx files at the moment
  // ignoreNoDocuments: true,
};

export default config;
