# @service-kit/config-loader

This package exports a function that will read in environment variables, read specified config files and return a generated config object. Utilises [Convict](https://www.npmjs.com/package/convict) under the hood.

## Features

- Automatically provides a `Base` configuration object with the `env` specified.
- Merges in all specified configuration files and populates environmental variables / default values.
- Validates your config.

## Getting started

```sh
yarn add @service-kit/config-loader
```

After installing, execute the package and configure as necessary.

```js
const config = require('@service-kit/config-loader');

const myConfigObject = config({
  configPaths: ['./path/to/config1.json', './path/to/config1.json']
});
```

## Options

The package takes the following parameters:

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
