### Building development docker file
To be able to build and run the dev docker file make sure to copy your .npmrc file inside your service directory before running `docker build`.
Tagging your image is optional.

```bash
  docker build -t <docker_image_tag> -f Dockerfile.dev .
```

### Extending the base docker file
The provided base Dockerfile should cover building, testing and running your service. If you need additional steps they can be added there.

When cleaning up make sure you remove all dev dependencies and offline caches as well as all obsolete artifacts after the service has been built, and especially your .npmrc fie.

Also make sure to keep the build and cleanup tasks in a single docker layer, as this will give you a smaller in size image in the end.

Example docker file:

```bash
...
  # Keep the installation and cleanup in a single docker layer s it later results in slimmer images.
  RUN yarn install \
    && yarn build:prod \
    && yarn lintify \
    && yarn test \
    && yarn cache clean \
    && rm -rf src test coverage jest.config.js .eslintrc.js tsconfig*.json \
    && rm -rf node_modules \
    && NODE_ENV=production yarn install --production \
    && rm -rf package*.json .npmrc \
    && rm -rf /usr/local/share/.cache/yarn

```
