FROM node:alpine
# FROM mhart/alpine-node:10

RUN mkdir /app
COPY . /app

WORKDIR /app

# Based on: https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#node-gyp-alpine
RUN apk add --no-cache --virtual .gyp python make g++ \
  && npm install \
  && apk del .gyp

RUN node -v

EXPOSE 5111

CMD ["npm", "start"]