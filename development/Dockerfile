FROM node:14-alpine

WORKDIR /usr/src/app

EXPOSE 3000

ENV DEBUG="*"
ENV NODE_ENV="development"
ENV API="http://rtst.taeco.info:5000/"
ENV DB_TYPE="mysql"
ENV DB_HOST="mariadb.taeco.info"
ENV DB_PORT=3307
ENV DB_NAME="DB-RTST"
ENV DB_USER="rtst"
ENV DB_PASS="RTSTxorhkd77^^"

ENTRYPOINT ["npm", "test"]
