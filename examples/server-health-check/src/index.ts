import { redis, anotherService } from './healthchecks';
import redisModule from '@service-kit/redis';
import core from '@service-kit/core';

(async () => {
  const { server } = await core({
    id: 'health-service',
    name: 'health-service',
    configPaths: [
      `${__dirname}/healthchecks/config/config`,
      `${__dirname}/healthchecks/config/features.json`
    ],
    modules: [redisModule],
    api: {
      contractPaths: [],
      controllerPaths: [],
      healthChecks: [anotherService],
      externalChecks: [redis]
    }
  });

  await server.listen(3002);
})();
