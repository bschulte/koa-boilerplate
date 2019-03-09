FROM node:alpine


RUN npm i -g pm2

RUN mkdir /app

WORKDIR /app

COPY package*.json ./
# Based on: https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#node-gyp-alpine
RUN apk add --virtual .gyp python make g++ \
  && npm install \
  && apk del .gyp
COPY . .

EXPOSE 5111

RUN node -v

CMD ["npm", "run", "docker:pm2"]