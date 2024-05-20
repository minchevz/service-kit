# @service-kit/elasticsearch

This package exports a ServiceKit module that allows the use of elasticsearch.

## Getting started

This module is compatible with Node 18+ and is distributed on artifactory.

```
yarn add @service-kit/elasticsearch
```

After installing, you must instantiate it within your project as per:

```ts
import elasticsearchLib from '@service-kit/elasticsearch';

await elasticsearchLib.bootstrap(config, logger);

// elasticsearch now available for import in external files
import { elasticsearch } from '@service-kit/elasticsearch';
```

## Configuration

All configuration can be specified by environment variables. Your config schema needs to have a top level `SEARCH` property with the following details:

```js
{
  "SEARCH": {
    "HOST": {
      "doc": "Elasticsearch host url",
      "default": '',
      "env": "HOST"
    }
  }
}
```
