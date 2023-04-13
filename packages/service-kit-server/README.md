# @service-kit/server

This package exports a function that will create a Koa server instance with sensible middleware and defaults pre-configured.

## Features

* Automatically loads in Koa-bodyparser and error handling middleware.
* Exports a `waitFor` function to allow delaying the listen event until certain promises have resolved.
* Exports the @Koa/Router Context for use externally.

## Getting started

```sh
yarn add @service-kit/server
```

After installing, execute the package and configure as necessary.

```js
const server = require('@service-kit/server');

const myServerInstance = server();

```

## Options

The package takes the following parameters:

### contractPaths

An array of file locations for the service contract definitions. Expects each item to be an OpenAPI / Swagger specification file. Will automatically parse and merge all contracts.

```js
{
    contractPaths: [
        `${__dirname}/contracts/basic.yml`,
        `${__dirname}/contracts/auth.yml`
        `${__dirname}/contracts/games.yml`
    ]
}
```

### controllerPaths

An array of directories in which to auto-lookup route controllers.

```js
{
    controllerPaths: [
        `${__dirname}/src/controllers/`,
        `${__dirname}/packages/auth/controllers`
    ]
}
```
### [Overload-protection middleware](https://confluence.gamesys.co.uk/pages/viewpage.action?pageId=265361370)
