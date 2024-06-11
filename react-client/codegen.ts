import type { CodegenConfig } from '@graphql-codegen/cli';
import { DateTimeResolver } from 'graphql-scalars';

const config: CodegenConfig = {
  // GraphQL server for codegen to infer types and their fields from
  schema: "http://localhost:4000",
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
    }
  },
  // Ignore that we don't have any tsx files at the moment
  // ignoreNoDocuments: true,
};

export default config;
