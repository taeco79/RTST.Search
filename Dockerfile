FROM node:14-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 80

ENV NODE_ENV="production"

ENTRYPOINT ["npm", "start"]