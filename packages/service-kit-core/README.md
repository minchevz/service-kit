# @service-kit/core

This package exports a utility function which provides most of the most common utilities and functionalities .
## Table of contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Modules](#modules)
- [Contract Paths](#contractPaths)
- [Controller Paths](#controllerPaths)
- [Chimera Authentication Service](#chimera-authentication-service)
- [Circuit Breaker](#circuit-breaker)

---
## Features

* Automatically loads, instantiates and exports the @service-kit/config-loader module.
* Automatically bootstraps and provides server functionality.

## Getting started

```sh
yarn add @service-kit/core
```

After installing, execute the package and configure as necessary.

```js
const service, { Context, modules } = require('@service-kit/core');

(async () => {
    const { server, config } = await service({
        id: 'my-service',
        name: 'my-service-name',
        version: `${ process.env.npm_package_version }`,
        configPaths: [
            `${ __dirname }/config/example.json`
        ],
        api: {
            contractPaths: [],
            controllerPaths: [],
        }
    });

    server.listen(3000);
    
    // All configuration properties
    config.getProperties(); 
})()

```

## Usage

The default export is an asynchronous function which takes the ServiceManifest and performs various actions based on the provided value.

### Named Exports


#### Context


The @koa/router RouterContext for usage inside your controller functions. For example:

```ts
const { Context } = require('@service-kit/core');

export default (ctx: Context) => {
    ctx.body = "Hello World";
}

```

#### modules


As the @service-kit/core will instantiate common modules such as config as well as any modules that you provide to it. As these are often dependent on the provided manifest options and / or other modules, they are only available after executing the main default function.

Although you can access the modules object before executing the main function, trying to access any properties on it will cause an error to be thrown.

```ts
const { Context, modules } = require('@service-kit/core');

export default (ctx: Context) => {
    const { config } = modules;
    ctx.body = {
        allConfigProperties: config.getProperties()
    };
}

```


## Options

The package takes the following parameters:

### id

The unique ID of your service.

### name

The user friendly name of your service.

### version

Unique version to trace code releases.

### configPaths

Optional array of config file locations. Each file should contain a single Object with configuration in the format of a Convict schema. For instance:

```json
{
    "Client": {
        "example": {
            "doc": "The NODE_CLIENT_EXAMPLE environment.",
            "default": "my-default-value",
            "env": "NODE_CLIENT_EXAMPLE"
        }
    }
}
```

### api

Provided as is to the @service-kit/server package.

#### contractPaths

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

#### controllerPaths

An array of directories in which to auto-lookup route controllers.

```js
{
    controllerPaths: [
        `${__dirname}/src/controllers/`,
        `${__dirname}/packages/auth/controllers`
    ]
}
```

#### Chimera Authentication Service

Its a built-in chimera auth functionality that provides a flexibility to use as standalone logic in any level of the codebase.
see how to use in : examples/core-authentication 

#### Circuit Breaker

Its a built-in resiliency pattern which is widely used in microservice architectures to fail faster and smarter before overloading apps. Circuit Breaker pattern is used by netflix as well which is called hystrix api.
In core module the pattern is provided by opossum npm package which gives lots of configurations and setup.

- how to use?
first in any service should be imported via 
import { CircuitBreaker } from '@service-kit/core';
then boostrap as
CircuitBreaker.bootstrap();

see usage example in /examples/core-circuit-breaker
