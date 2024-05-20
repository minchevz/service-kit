import core from '@service-kit/core';
import { ServerExport } from '@service-kit/server/types';
import queue from '@service-kit/queue';
import redis from '@service-kit/redis';

export default async (): Promise<ServerExport> => {
  const { server } = await core({
    id: 'core-cache-loader',
    name: 'core-cache-loader',
    configPaths: [
      `${__dirname}/config/config`,
      `${__dirname}/config/redisCache.json`,
      `${__dirname}/config/nodeCache.json`,
      `${__dirname}/config/queueConfig.json`
    ],
    modules: [redis, queue],
    api: {
      contractPaths: [`${__dirname}/contract/v1/example.yml`],
      controllerPaths: [`${__dirname}/controllers/`],
      queueWorkerPaths: [`${__dirname}/listeners/`]
    }
  });

  return server;
};
