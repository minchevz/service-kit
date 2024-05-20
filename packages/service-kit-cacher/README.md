# @service-kit/cacher

This package exports a ServiceKit module that allows redis and node memory caching functionality.

## Features

- Module provides only 3 main caching functions for redis and node-memory. GET,SET,DEL
- By default it runs node-memory caching mechanism.
- Requires configuration json and config loader to create a caching instance.

## Getting started

This module is compatible with Node 18+ and is distributed on artifactory.

```
yarn add @service-kit/cacher
```

After installing, you must instantiate it within your project as per:

```ts
import redisLib from '@service-kit/redis';

await redisLib.bootstrap(config, logger);

// redis now available for import in external files
import { redis } from '@service-kit/redis';
```

And for usage of node-memory :

```ts
await cacher.bootstrap(null, config, console);
```

## Configuration

All configuration can be specified by environment variables. Your config schema needs to have a top level `CACHE` property with the following details:

For Redis :

```js
{
  "CACHE": {
    "CACHE_PREFIX": {
      "doc": "[Feature] cachePrefix.",
      "default": "library-redis",
      "env": "CACHE_PREFIX"
    },
    "REDIS_MONITOR": {
      "doc": "[Feature] redisMonitor.",
      "default": false,
      "env": "REDIS_MONITOR"
    },
    "CACHE_TTL": {
      "doc": "[Feature] cacheTTL.",
      "default": null,
      "env": "CACHE_TTL"
    },
    "REDIS": {
      "REDIS_NAME": {
        "doc": "[Feature] redisMasterName",
        "default": "master",
        "env": "NODE_REDIS_MASTER_NAME"
      },
      "REDIS_PASSWORD": {
        "doc": "[Feature] password.",
        "default": "",
        "env": "NODE_REDIS_MASTER_AUTH_PASSWORD"
      },
      "REDIS_MAX_RETRIES_PER_REQUEST": {
        "doc": "[Feature] maxRetriesPerRequest.",
        "default": 1,
        "env": "REDIS_MAX_RETRIES_PER_REQUEST"
      },
      "REDIS_ENABLE_OFFLINE_QUEUE": {
        "doc": "[Feature] enableOfflineQueue.",
        "default": false,
        "env": "REDIS_ENABLE_OFFLINE_QUEUE"
      }
    }
  }
}
```

For node memory :

```js
"CACHE2": {
    "CACHE_PREFIX": {
      "doc": "[Feature] sample.",
      "default": "library-node",
      "env": "CACHE_PREFIX"
    },
    "CACHE_TTL": {
      "doc": "[Feature] sample.",
      "default": 10,
      "env": "CACHE_TTL"
    },
    "NODE_CACHE_OPTIONS": {
      "stdTTL": {
        "doc": "[Feature] stdTTL.",
        "default": 0,
        "env": "NODE_CACHE_StdTTL"
      },
      "checkperiod": {
        "doc": "[Feature] checkperiod.node-cache default value is 600, 0 means no periodic check",
        "default": 600,
        "env": "NODE_CACHE_CHECK_PERIOD"
      }
    }
  }
```

Additionally, if you want to pass in `redisOptions` through to the cluster constructor as per the [IORedis documentation](https://github.com/luin/ioredis/#cluster), you can also provide the `REDIS` config key (as per other examples) which will be mapped as usual.

Each cluster node can have a port and password provided - by default the port is 6379 and the password is null. You can override these values on a node by node basis (as per the above example). The first node has a password, the second node doesn't - the second node has a custom port, the first doesn't.

## Sentinels

If you are want to configure sentinels for your environment, you'll need to have a configuration that looks akin to:

```js
{
  "CACHE": {
    ... previousConfigOptions,
    "REDIS": {
      ... previousRedisOptions,
      "REDIS_NAME": {
        "doc": "[Feature] name",
        "default": "master",
        "env": "REDIS_NAME"
      },
      "SENTINEL_PASSWORD": {
        "doc": "[Feature] sentinelPassword",
        "default": "",
        "env": "REDIS_SENTINEL_PASSWORD"
      },
      "SENTINEL_HOST_0": {
        "doc": "[Feature] first sentinelHost",
        "default": "",
        "env": "REDIS_SENTINEL_HOST_0"
      },
      "SENTINEL_HOST_1": {
        "doc": "[Feature] second sentinelHost",
        "default": "",
        "env": "REDIS_SENTINEL_HOST_1"
      },
      "SENTINEL_PORT_1": {
        "doc": "[Feature] second sentinel port",
        "default": "26379",
        "env": "REDIS_SENTINEL_PORT_1"
      }
    }
  }
}
```

The default port for a Redis Sentinel is 26379, so by default, unless you specify an explicit `PORT` for a sentinel (as above for the second sentinel), the library will assume each one is running on the default.
