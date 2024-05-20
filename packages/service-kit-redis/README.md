# @service-kit/redis

This package exports a ServiceKit module that allows redis caching functionality.

## Getting started

This module is compatible with Node 18+ and is distributed on artifactory.

```
yarn add @service-kit/redis
```

After installing, you must instantiate it within your project as per:

```ts
import redisLib from '@service-kit/redis';

await redisLib.bootstrap(config, logger);

// redis now available for import in external files
import { redis } from '@service-kit/redis';
```

## Configuration

All configuration can be specified by environment variables. Your config schema needs to have a top level `CACHE` property with the following details:

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

## Cluster Mode

If you are running a cluster of Redis nodes, you will have to specify the configuration like:

```js
{
  "CACHE": {
    ... previousConfigOptions,
    "CLUSTER": {
      "CLUSTER_NODE_HOST_0": {
        "doc": "[Feature] first cluster node Host",
        "default": "",
        "env": "REDIS_CLUSTER_NODE_HOST_0"
      },
      "CLUSTER_NODE_PASSWORD_0": {
        "doc": "[Feature] first cluster node password",
        "default": "",
        "env": "REDIS_CLUSTER_NODE_PASSWORD_0"
      },
      "CLUSTER_NODE_HOST_1": {
        "doc": "[Feature] second cluster node Host",
        "default": "",
        "env": "REDIS_CLUSTER_NODE_HOST_1"
      },
      "CLUSTER_NODE_PORT_1": {
        "doc": "[Feature] second cluster node port",
        "default": "",
        "env": "REDIS_CLUSTER_NODE_PORT_1"
      }
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
