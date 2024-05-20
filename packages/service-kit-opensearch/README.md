# @service-kit/opensearch

This package exports a ServiceKit module that allows the use of opensearch.

## Getting started

This module is compatible with Node 18+ and is distributed on artifactory.

```
yarn add @service-kit/opensearch
```

After installing you can use it as part of the modules, see the `examples/aws-opensearch-core` on how to configure and use.


## Configuration

All configuration can be specified by environment variables. Your config schema needs to have a top level `SEARCH` property with the following details:

```js
{
  "SEARCH": {
    "HOST": {
      "doc": "The host url for aws-openseach",
      "default": "<aws-os-url>",
      "env": "NODE_OPENSEARCH_HOST"
    },
    "AUTH": {
      "username": {
        "doc": "The basic auth username",
        "default": "<aws-os-username>",
        "env": "NODE_OPENSEARCH_USERNAME"
      },
      "password": {
        "doc": "The basic auth password",
        "default": "<aws-os-password>",
        "env": "NODE_OPENSEARCH_PASSWORD"
      }
    },
    "API_KEY": {
      "doc": "AWS API Key",
      "default": "<aws-api-key>",
      "env": "NODE_OPENSEARCH_API_KEY"
    }
  }
}
```

## Usage

Get Index data

```ts
  const { body } = await modules.openSearch.cat.indices({
    format: 'json',
    h: 'index,health,status'
  });
```
