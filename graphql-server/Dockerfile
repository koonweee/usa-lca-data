# Uses the node base image with the latest LTS version
FROM node:lts-alpine3.20
# Informs Docker that the container listens on the 
# specified network ports at runtime
EXPOSE 4000
# Copies index.js and the two package files from the local 
# directory to a new app directory on the container
COPY .  app/
RUN rm -rf app/package-lock.json
# Changes working directory to the new directory just created
WORKDIR /app
ARG NODE_OPTIONS=--max_old_space_size=900
# Installs npm dependencies on container
RUN npm install
RUN npm build
# Command container will actually run when called
CMD ["npm", "run", "dev"]
