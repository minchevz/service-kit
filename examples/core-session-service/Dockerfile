FROM registry-redhat-io.artifactory.gamesys.co.uk/ubi8/nodejs-18

USER root

WORKDIR /opt/app-root/src

RUN curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo && yum install -y yarn

COPY .npmrc package*.json tsconfig*.json jest.config.js .eslintrc.js yarn.lock ./
COPY ./src ./src
COPY ./test ./test

# Keep the installation and cleanup in a single docker layer as it later results in slimmer images.
RUN yarn install --network-timeout 600000 \
    && yarn build:prod \
    && chmod -R 555 /opt/app-root/src/dist \
    && yarn copy \
    && yarn lintify \
    && yarn test \
    && yarn cache clean \
    && rm -rf src test coverage jest.config.js .eslintrc.js tsconfig*.json \
    && rm -rf node_modules \
    && NODE_ENV=production yarn install --production --network-timeout 600000 \
    && rm -rf package*.json .npmrc \
    && rm -rf /usr/local/share/.cache/yarn

ENV NODE_ENV=production

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE ${PORT}

USER default

CMD [ "node", "dist/index.js" ]
