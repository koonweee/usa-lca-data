# syntax=docker.io/docker/dockerfile:1.7-labs
FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY --exclude=node_modules . .

RUN npm run build

EXPOSE 80

CMD [ "npm", "run", "preview" ]

# docker build --platform linux/amd64 -t lca-fe .
# docker save lca-fe | gzip > ../lca-fe.tar.gz
# scp ../lca-fe.tar.gz dev@167.71.223.52:~/
# docker load < lca-fe.tar.gz
# docker run -p 80:80 lca-fe
