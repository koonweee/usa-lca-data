# Uses the node base image with the latest LTS version
FROM node:18-alpine3.16
# Informs Docker that the container listens on the
# specified network ports at runtime
EXPOSE 4000
# Copies index.js and the two package files from the local
# directory to a new app directory on the container
COPY prisma /app/prisma
COPY src /app/src
COPY .env /app/.env
COPY package.json /app/package.json
COPY nexus-typegen.ts /app/nexus-typegen.ts
COPY schema.graphql /app/schema.graphql
COPY tsconfig.json /app/tsconfig.json

# Changes working directory to the new directory just created
WORKDIR /app
# Installs npm dependencies on container
RUN npm install
# Command container will actually run when called
# CMD ["npm", "run", "build"]
CMD ["npm", "run", "buildAndDev"]
