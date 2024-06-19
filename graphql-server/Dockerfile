# syntax=docker.io/docker/dockerfile:1.7-labs
FROM node:18-alpine

EXPOSE 4000

WORKDIR /app

COPY package.json .

RUN npm install

COPY --exclude=node_modules . .

RUN npm run build

CMD ["npm", "run", "dev"]

# docker build --platform linux/amd64 -t graphql-server .
# docker save graphql-server | gzip > ../graphql-server.tar.gz
# scp ../graphql-server.tar.gz dev@167.71.223.52:~/
# docker load < graphql-server.tar.gz
# docker run -p 4000:4000 graphql-server
