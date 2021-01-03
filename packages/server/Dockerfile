FROM node:14 AS build
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY . .
RUN yarn
RUN npx tsc -p ./tsconfig.json

FROM node:14
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --production
COPY --from=build /usr/src/app/build build
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "run", "serve"]